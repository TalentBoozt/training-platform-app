import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {format, utcToZonedTime, zonedTimeToUtc} from 'date-fns-tz';
import {DomSanitizer} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {CoursesService} from '../../../../services/courses.service';
import {AlertsService} from '../../../../services/support/alerts.service';
import {WindowService} from '../../../../services/common/window.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-module-card',
  imports: [
    NgIf,
    FormsModule,
    NgClass,
    NgForOf
  ],
  templateUrl: './module-card.component.html',
  styleUrl: './module-card.component.scss',
  standalone: true
})
export class ModuleCardComponent {
  @Input() employeeId: any
  @Input() courseId: any
  @Input() module: any
  @Input() installment: any
  @Input() moduleIndex: any
  @Input() employee: any
  @Input() materials: any[] = []
  @Input() recordings: any[] = []
  @Input() assignments: any[] = []
  @Output() bankPayment: EventEmitter<any> = new EventEmitter<any>();

  expanded: boolean = false;
  selectedMaterial: any = null;
  showMaterialModal: boolean = false;

  publicMaterials: any[] = [];
  publicRecordings: any[] = [];
  publicAssignments: any[] = [];
  couponCode: string = '';
  couponCodeError: any;
  couponCodeLoading: boolean = false;

  constructor(private sanitizer: DomSanitizer,
              private router: Router,
              private courseService: CoursesService,
              private alertService: AlertsService,
              private windowService: WindowService) {
  }

  ngOnInit(): void {
    this.publicMaterials = this.materials.filter((material: any) => material.visibility == 'public');
    this.publicRecordings = this.recordings.filter((recording: any) => recording.visibility == 'public');
    this.publicAssignments = this.assignments.filter((assignment: any) => assignment.visibility == 'public');
  }

  toggleExpand(): void {
    if (this.isUnlocked()) {
      this.expanded = !this.expanded;
    }
  }

  isUnlocked(): boolean {
    return this.installment?.paid === 'paid' || this.installment?.paid === 'free';
  }

  coursePrice(): string {
    if (this.installment?.paid === 'free') return 'Free';
    return this.installment?.currency + ' ' + this.installment?.price || 'Free';
  }

  openBankPayment(): void {
    this.bankPayment.emit(this.installment);
  }

  makePayment(installmentId: any) {
    if (installmentId && (installmentId == this.installment.id)) {
      if(this.installment.productId && this.installment.priceId) {
        this.alertService.warningMessage('Payment methods not allowed in Preview Mode', 'Warning');
      }
    }
  }

  getMaterialIcon(url: string): string {
    if (!url) return 'assets/icons/file.png';

    url = url.toLowerCase();

    if (url.includes('drive.google.com')) return 'assets/icons/drive.png';
    if (url.includes('dropbox.com')) return 'assets/icons/dropbox.png';
    if (url.includes('firebase')) return 'assets/icons/firebase.png';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'assets/icons/youtube.png';
    if (url.includes('amazonaws.com')) return 'assets/icons/amazon.png';
    if (url.includes('github.com') || url.includes('raw.githubusercontent.com')) return 'assets/icons/github.png';
    if (url.includes('icloud.com')) return 'assets/icons/icloud.png';
    if (url.includes('linkedin.com')) return 'assets/icons/linkedin.png';
    if (url.includes('mega.nz')) return 'assets/icons/mega.png';
    if (url.includes('onedrive.live.com') || url.includes('1drv.ms')) return 'assets/icons/onedrive.png';

    return 'assets/icons/file.png';
  }

  previewMaterial(material: any) {
    this.selectedMaterial = material;
    this.showMaterialModal = true;
  }

  isPDF(mat: any): boolean {
    return mat.type === 'pdf';
  }

  isImage(mat: any): boolean {
    return mat.type === 'image';
  }

  isVideo(mat: any): boolean {
    return mat.url?.includes('youtube.com') || mat.url?.includes('youtu.be');
  }

  isExternal(mat: any): boolean {
    return !this.isPDF(mat) && !this.isImage(mat) && !this.isVideo(mat);
  }

  trustedUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  trustedVideoUrl(url: string) {
    let embedUrl = url;

    if (url.includes('watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be')) {
      embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  formatTime(date: string, time: string, timezone: string): string {
    if (!time) return '-';
    if (!date) date = new Date().toISOString().split('T')[0];

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (timezone && date) {
      const dateTimeStr = `${date}T${time}`;
      const utcTime = zonedTimeToUtc(dateTimeStr, timezone);
      const trainerTime = utcTime.toISOString();

      const userTime = utcToZonedTime(trainerTime, userTimezone);
      time = format(userTime, 'HH:mm', { timeZone: userTimezone });
    }

    // Replace "." with ":"
    time = time.replace('.', ':');

    // Split time
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr || '0', 10);

    const suffix = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    const hourFormatted = hour < 10 ? '0' + hour : hour;
    const minuteFormatted = minute < 10 ? '0' + minute : minute;

    return `${hourFormatted}:${minuteFormatted} ${suffix} (${userTimezone})`;
  }

  validateCouponCode() {
    this.couponCodeLoading = true;
    // todo
  }

  takeQuiz(quizzId: any) {
    if (quizzId && this.courseId) {
      this.router.navigate(['quiz', this.courseId, quizzId]);
    }
  }
}
