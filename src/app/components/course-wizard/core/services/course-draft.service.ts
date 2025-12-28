import { Injectable, signal, computed, effect, Signal, inject } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CourseDraft, Lecture, ModuleModel } from '../../models/course.model';
import { WindowService } from './common/window.service';

const LS_KEY = 'course_draft_v1';

@Injectable({
    providedIn: 'root',
})
export class CourseDraftService {
    private windowService = inject(WindowService);
    private _draft = signal<CourseDraft>(this._load() ?? this._newDraft());
    // for reactive form-driven autosave:
    private formChanges$ = new BehaviorSubject<CourseDraft | null>(null);

    draft$: Signal<CourseDraft> = computed(() => this._draft());

    constructor(private fb: FormBuilder) {
        // effect to persist on draft changes but *debounced* through behavior subject
        // use subscription to debounce and persist
        this.formChanges$
            .pipe(debounceTime(600))
            .subscribe((d) => {
                if (d) this._persist(d);
            });
    }

    private _newDraft(): CourseDraft {
        return {
            id: uuidv4(),
            title: '',
            subtitle: '',
            description: '',
            courseType: 'recorded',
            modules: [],
            price: null,
            published: false,
            approved: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    private _load(): CourseDraft | null {
        try {
            if (!this.windowService.nativeLocalStorage) return null;
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as CourseDraft;
        } catch (e) {
            console.warn('Failed to load draft', e);
            return null;
        }
    }

    private _persist(draft: CourseDraft) {
        draft.updatedAt = new Date().toISOString();
        try {
            if (this.windowService.nativeLocalStorage) {
                localStorage.setItem(LS_KEY, JSON.stringify(draft));
                this._draft.set(draft);
            }
        } catch (e) {
            console.error('Failed to persist draft', e);
        }
    }

    // get a snapshot
    getSnapshot(): CourseDraft {
        return structuredClone(this._draft());
    }

    // update partial
    update(partial: Partial<CourseDraft>) {
        const updated = { ...this._draft(), ...partial, updatedAt: new Date().toISOString() };
        this.formChanges$.next(updated);
        this._draft.set(updated);
    }

    // replace full draft (e.g. when step form saves)
    setFullDraft(draft: CourseDraft) {
        this.formChanges$.next(draft);
        this._draft.set(draft);
    }

    // helpers for modules/lectures
    addModule(module: Partial<ModuleModel>) {
        const m: ModuleModel = {
            id: uuidv4(),
            title: module.title ?? 'Untitled Module',
            description: module.description ?? '',
            freePreview: module.freePreview ?? false,
            lectures: module.lectures ?? [],
            order: (this._draft().modules.length || 0) + 1,
            createdAt: new Date().toISOString(),
        };
        const updated = { ...this._draft(), modules: [...this._draft().modules, m] };
        this.setFullDraft(updated);
        return m;
    }

    updateModule(id: string, patch: Partial<ModuleModel>) {
        const modules = this._draft().modules.map((mod) => (mod.id === id ? { ...mod, ...patch } : mod));
        this.setFullDraft({ ...this._draft(), modules });
    }

    removeModule(id: string) {
        const modules = this._draft().modules.filter((m) => m.id !== id);
        this.setFullDraft({ ...this._draft(), modules });
    }

    reorderModules(newModules: ModuleModel[]) {
        this.setFullDraft({ ...this._draft(), modules: newModules });
    }

    // lecture helpers
    addLectureToModule(moduleId: string, lecture: Partial<Lecture>) {
        const l: Lecture = {
            id: uuidv4(),
            title: lecture.title ?? 'Untitled Lecture',
            description: lecture.description ?? '',
            notes: lecture.notes ?? '',
            videoUrl: lecture.videoUrl,
            duration: lecture.duration ?? 0,
            createdAt: new Date().toISOString(),
            materials: lecture.materials ?? [],
            freePreview: lecture.freePreview ?? false,
        };
        const modules = this._draft().modules.map((m) =>
            m.id === moduleId ? { ...m, lectures: [...m.lectures, l] } : m
        );
        this.setFullDraft({ ...this._draft(), modules });
        return l;
    }

    updateLecture(moduleId: string, lectureId: string, patch: Partial<Lecture>) {
        const modules = this._draft().modules.map((m) =>
            m.id === moduleId ? { ...m, lectures: m.lectures.map((l) => (l.id === lectureId ? { ...l, ...patch } : l)) } : m
        );
        this.setFullDraft({ ...this._draft(), modules });
    }

    removeLecture(moduleId: string, lectureId: string) {
        const modules = this._draft().modules.map((m) =>
            m.id === moduleId ? { ...m, lectures: m.lectures.filter((l) => l.id !== lectureId) } : m
        );
        this.setFullDraft({ ...this._draft(), modules });
    }

    // clear draft
    clearDraft() {
        if (this.windowService.nativeLocalStorage) {
            localStorage.removeItem(LS_KEY);
            this._draft.set(this._newDraft());
        }
    }
}
