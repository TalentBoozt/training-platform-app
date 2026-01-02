import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormArray,
    FormBuilder,
    FormGroup, FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription, debounceTime } from 'rxjs';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { VideoPreviewComponent } from '../../../shared/components/video-preview/video-preview.component';
import { CourseDraftService } from '../../../core/services/course-draft.service';
import { FileResource, ModuleModel } from '../../../models/course.model';
import { RichTextEditorComponent } from '../../../../shared/elements/rich-text-editor/rich-text-editor.component';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
    selector: 'app-modules-step',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DragDropModule,
        FileUploaderComponent,
        VideoPreviewComponent,
        RichTextEditorComponent,
        FormsModule,
        TruncatePipe
    ],
    templateUrl: './modules-step.component.html',
    styleUrl: './modules-step.component.scss',
})
export class ModulesStepComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private draftService = inject(CourseDraftService);

    expandedModules: boolean[] = [];
    expandedLectures: { [moduleIndex: number]: boolean[] } = {};

    form: FormGroup;
    private sub = new Subscription();

    notesContent: any;

    timeConverter = {
        hours: 0,
        minutes: 0,
        seconds: 0
    };

    modulesSignal = signal<ModuleModel[]>([]);

    constructor() {
        const draft = this.draftService.getSnapshot();
        this.form = this.fb.group({
            modules: this.fb.array(
                (draft.modules || []).map((m) =>
                    this.fb.group({
                        id: [m.id],
                        title: [m.title || '', Validators.required],
                        description: [m.description || ''],
                        freePreview: [!!m.freePreview],
                        lectures: this.fb.array(
                            (m.lectures || []).map((l) => {
                                const { minutes, seconds } = this.getDurationParts(l.duration || 0);
                                return this.fb.group({
                                    id: [l.id],
                                    title: [l.title || '', Validators.required],
                                    videoUrl: [l.videoUrl || '', Validators.required],
                                    description: [l.description || ''],
                                    notes: [l.notes || ''],
                                    duration: [l.duration || 0, [Validators.min(0)]],
                                    durationMinutes: [minutes, [Validators.min(0)]],
                                    durationSeconds: [seconds, [Validators.min(0), Validators.max(59)]],
                                    materials: [[...(l.materials || [])]],
                                });
                            })
                        )
                    })
                )
            ),
        });
    }

    ngOnInit(): void {
        this.modulesSignal.set(this.draftService.getSnapshot().modules || []);
        const modulesCtrl = this.form.get('modules') as FormArray;
        this.sub.add(
            modulesCtrl.valueChanges.pipe(debounceTime(700)).subscribe(() => {
                this.syncToService();
            })
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    get modules(): FormArray {
        return this.form.get('modules') as FormArray;
    }

    moduleGroup(i: number): FormGroup {
        return this.modules.at(i) as FormGroup;
    }

    getLectures(moduleIndex: number): FormArray {
        return this.moduleGroup(moduleIndex).get('lectures') as FormArray;
    }

    addModule() {
        const g = this.fb.group({
            id: [null],
            title: ['', Validators.required],
            description: [''],
            freePreview: [false],
            lectures: this.fb.array([]),
        });
        this.modules.push(g);
        this.syncToService();
    }

    removeModule(i: number) {
        this.modules.removeAt(i);
        this.syncToService();
    }

    addLecture(moduleIndex: number) {
        const lectures = this.getLectures(moduleIndex);
        const g = this.fb.group({
            id: [null],
            title: ['', Validators.required],
            videoUrl: ['', Validators.required],
            description: [''],
            notes: [''],
            duration: [0, [Validators.min(0)]],
            durationMinutes: [0, [Validators.min(0)]],
            durationSeconds: [0, [Validators.min(0), Validators.max(59)]],
            materials: [[]],
        });
        lectures.push(g);
        this.syncToService();
    }

    removeLecture(moduleIndex: number, lectureIndex: number) {
        this.getLectures(moduleIndex).removeAt(lectureIndex);
        this.syncToService();
    }

    onLectureFileSelected(file: File, moduleIndex: number, lectureIndex: number) {
        const url = URL.createObjectURL(file);
        const lecture = this.getLectures(moduleIndex).at(lectureIndex) as FormGroup;
        lecture.patchValue({ videoUrl: url });

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            const duration = Math.round(video.duration);
            const { minutes, seconds } = this.getDurationParts(duration);
            lecture.patchValue({
                duration: duration,
                durationMinutes: minutes,
                durationSeconds: seconds
            });
            URL.revokeObjectURL(video.src);
        };
        video.src = url;

        this.syncToService();
    }

    dropModule(event: CdkDragDrop<any[]>) {
        if (event.previousIndex === event.currentIndex) return;
        moveItemInArray(this.modules.controls, event.previousIndex, event.currentIndex);
        const modulesValue = this.modules.controls.map((ctrl) => ctrl.value);
        this.rebuildModulesFromValue(modulesValue);
        this.syncToService();
    }

    dropLecture(moduleIndex: number, event: CdkDragDrop<any[]>) {
        const lectures = this.getLectures(moduleIndex);
        if (event.previousIndex === event.currentIndex) return;
        moveItemInArray(lectures.controls, event.previousIndex, event.currentIndex);
        const lecturesValue = lectures.controls.map((c) => c.value);
        this.rebuildLecturesFromValue(moduleIndex, lecturesValue);
        this.syncToService();
    }

    private rebuildModulesFromValue(modulesValue: any[]) {
        const arr = this.fb.array(
            modulesValue.map((m) =>
                this.fb.group({
                    id: [m.id],
                    title: [m.title, Validators.required],
                    description: [m.description],
                    freePreview: [m.freePreview],
                    lectures: this.fb.array(
                        (m.lectures || []).map((l: any) => {
                            const { minutes, seconds } = this.getDurationParts(l.duration || 0);
                            return this.fb.group({
                                id: [l.id],
                                title: [l.title, Validators.required],
                                videoUrl: [l.videoUrl, Validators.required],
                                description: [l.description],
                                notes: [l.notes],
                                duration: [l.duration || 0, [Validators.min(0)]],
                                durationMinutes: [minutes, [Validators.min(0)]],
                                durationSeconds: [seconds, [Validators.min(0), Validators.max(59)]],
                                materials: [[...(l.materials || [])]],
                            });
                        })
                    ),
                })
            )
        );
        this.form.setControl('modules', arr);
    }

    private rebuildLecturesFromValue(moduleIndex: number, lecturesValue: any[]) {
        const arr = this.fb.array(
            lecturesValue.map((l) => {
                const { minutes, seconds } = this.getDurationParts(l.duration || 0);
                return this.fb.group({
                    id: [l.id],
                    title: [l.title, Validators.required],
                    videoUrl: [l.videoUrl, Validators.required],
                    description: [l.description],
                    notes: [l.notes],
                    duration: [l.duration || 0, [Validators.min(0)]],
                    durationMinutes: [minutes, [Validators.min(0)]],
                    durationSeconds: [seconds, [Validators.min(0), Validators.max(59)]],
                    materials: [[...(l.materials || [])]],
                });
            })
        );
        this.moduleGroup(moduleIndex).setControl('lectures', arr);
    }

    saveDraft() {
        this.syncToService();
    }

    private syncToService() {
        const modulesValue = (this.form.get('modules') as FormArray).value as any[];

        const modules: ModuleModel[] = modulesValue.map((m, idx) => ({
            id: m.id ?? `m_${Date.now()}_${idx}`,
            title: m.title,
            description: m.description,
            freePreview: !!m.freePreview,
            lectures: (m.lectures || []).map((l: any, li: number) => ({
                id: l.id ?? `l_${Date.now()}_${idx}_${li}`,
                title: l.title,
                description: l.description,
                notes: l.notes,
                materials: l.materials || [],
                videoUrl: l.videoUrl,
                duration: l.duration,
                createdAt: new Date().toISOString(),
            })),
            order: idx + 1,
            createdAt: new Date().toISOString(),
        }));

        this.draftService.update({ modules });
        this.modulesSignal.set(modules);
    }

    previewModules(): ModuleModel[] {
        return this.modulesSignal();
    }

    getVideoUrl(i: number, j: number): string {
        return this.getLectures(i).at(j).get('videoUrl')?.value;
    }

    isEmbed(videoUrl: string): boolean {
        return (
            /youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com|dropbox\.com/.test(videoUrl) &&
            !/\.(mp4|webm|ogg)/.test(videoUrl)
        );
    }

    isAllowedVideoUrl(videoUrl: any): boolean {
        if (!videoUrl || videoUrl === '') return true;
        return (
            /youtube\.com|youtu\.be|vimeo\.com/.test(videoUrl)
        );
    }

    getLectureMaterials(moduleIndex: number, lectureIndex: number): FileResource[] {
        const lecture = this.getLectures(moduleIndex).at(lectureIndex) as FormGroup;
        return lecture.get('materials')?.value || [];
    }

    onLectureMaterialSelected(file: File, moduleIndex: number, lectureIndex: number) {
        const lecture = this.getLectures(moduleIndex).at(lectureIndex) as FormGroup;
        const materials = lecture.get('materials')?.value || [];

        const newFile: FileResource = {
            id: `mat_${Date.now()}`,
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file),
        };

        lecture.patchValue({ materials: [...materials, newFile] });
        this.syncToService();
    }

    removeLectureMaterial(moduleIndex: number, lectureIndex: number, fileIndex: number) {
        const lecture = this.getLectures(moduleIndex).at(lectureIndex) as FormGroup;
        const materials = lecture.get('materials')?.value || [];
        materials.splice(fileIndex, 1);
        lecture.patchValue({ materials });
        this.syncToService();
    }

    toggleModule(index: number) {
        this.expandedModules[index] = !this.expandedModules[index];
    }

    toggleLecture(moduleIndex: number, lectureIndex: number) {
        if (!this.expandedLectures[moduleIndex]) {
            this.expandedLectures[moduleIndex] = [];
        }
        this.expandedLectures[moduleIndex][lectureIndex] = !this.expandedLectures[moduleIndex][lectureIndex];
    }

    isLectureExpanded(moduleIndex: number, lectureIndex: number): boolean {
        return !!this.expandedLectures[moduleIndex]?.[lectureIndex];
    }

    saveNotes($event: any, moduleIndex: number, lectureIndex: number) {
        if ($event) {
            this.notesContent = $event;
            const lecture = this.getLectures(moduleIndex).at(lectureIndex) as FormGroup;
            lecture.patchValue({ notes: this.notesContent });
            this.syncToService();
        }
    }

    convertTimeToSeconds(i: number, j: number): void {
        const lecture = this.getLectures(i).at(j);
        const mins = lecture.get('durationMinutes')?.value || 0;
        const secs = lecture.get('durationSeconds')?.value || 0;
        const total = (mins * 60) + secs;

        lecture.patchValue({ duration: total }, { emitEvent: false });
        this.syncToService();
    }

    private getDurationParts(seconds: number) {
        if (!seconds) return { minutes: 0, seconds: 0 };
        return {
            minutes: Math.floor(seconds / 60),
            seconds: seconds % 60
        };
    }
}
