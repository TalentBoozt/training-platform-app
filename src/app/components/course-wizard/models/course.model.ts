export type CourseType = 'live' | 'recorded';

export interface FileResource {
    id?: string;
    name: string;
    type: string;
    url: string;
}

export interface Lecture {
    id: string;
    title: string;
    description?: string;
    notes?: string; // markdown or plain text
    materials?: FileResource[];
    videoUrl?: string; // remote url or data URL or uploaded media key
    duration?: number; // seconds
    createdAt?: string;
    freePreview?: boolean;
}

export interface ModuleModel {
    id: string;
    title: string;
    description?: string;
    freePreview?: boolean;
    lectures: Lecture[];
    order?: number;
    createdAt?: string;
}

export interface CourseDraft {
    id?: string;
    title?: string;
    subtitle?: string;
    lecturer?: string;
    lecturerNameTag?: string;
    lecturerEmail?: string;
    description?: string;
    courseType?: CourseType;
    modules: ModuleModel[];
    price?: number | null;
    discountedPrice?: number | null;
    isFree?: boolean;
    installment?: any;
    published?: boolean;
    approved?: boolean;
    language?: string;
    category?: string;
    level?: string;
    skills?: string[];
    requirements?: string[];
    certificate?: boolean;
    createdAt?: string;
    updatedAt?: string;
    companyId?: string;
    trainerId?: string;
}
