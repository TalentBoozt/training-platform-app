import {Component, inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TrainerProfile} from '../../shared/data-models/TrainerProfile';
import {TrainerProfileService} from '../../services/trainer-profile.service';
import {NgForOf, NgIf} from '@angular/common';
import {EmployeeAuthStateService} from '../../services/cacheStates/employee-auth-state.service';
import {debounceTime} from 'rxjs';
import {AlertsService} from '../../services/support/alerts.service';

@Component({
  selector: 'app-trainer-profile',
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgForOf
  ],
  templateUrl: './trainer-profile.component.html',
  styleUrl: './trainer-profile.component.scss',
  standalone: true
})
export class TrainerProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private trainerService = inject(TrainerProfileService);
  private employeeState = inject(EmployeeAuthStateService);
  private alertService = inject(AlertsService);

  profileForm!: FormGroup;
  profile?: TrainerProfile;
  username = '';
  employee: any;
  isEditing = false;

  currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY'];
  rateUnits = ['hour', 'day', 'session'];

  ngOnInit(): void {
    this.employeeState.employee$.subscribe(profile => {
      const employeeId = profile?.employee?.id;
      if (!employeeId) return;
      this.employee = profile?.employee;

      this.username = profile?.employee?.firstname + ' ' + profile?.employee?.lastname;
      const trainer = profile?.trainer ?? { employeeId } as TrainerProfile;

      this.profile = trainer;
      this.createForm(trainer);
    });
  }

  createForm(profile: TrainerProfile) {
    this.profileForm = this.fb.group({
      headline: [profile.headline ?? '', [Validators.required, Validators.maxLength(100)]],
      bio: [profile.bio ?? '', [Validators.maxLength(1000)]],
      specialties: this.fb.array((profile.specialties ?? []).map(s => this.fb.control(s))),
      languages: this.fb.array((profile.languages ?? []).map(l => this.fb.control(l))),
      hourlyRateAmount: [this.extractAmount(profile.hourlyRate) ?? '', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      hourlyRateCurrency: [this.extractCurrency(profile.hourlyRate) ?? 'USD'],
      hourlyRateUnit: [this.extractUnit(profile.hourlyRate) ?? 'hour'],
      availability: [profile.availability ?? '', [Validators.required, Validators.maxLength(150)]],
      website: [profile.website ?? '', [Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*\/?$/)]],
      linkedIn: [profile.linkedIn ?? '', [Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*\/?$/)]],
      youtube: [profile.youtube ?? '', [Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*\/?$/)]],
      isPublicProfile: [profile.isPublicProfile ?? true]
    });

    // Optional: live async validation (debounced)
    this.profileForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      // can use this for live char count, hints, etc.
    });
  }

  // --- Tag Input Logic ---
  get specialties() { return this.profileForm.get('specialties') as FormArray; }
  get languages() { return this.profileForm.get('languages') as FormArray; }

  addTag(control: FormArray, event: KeyboardEvent) {
    const input = (event.target as HTMLInputElement);
    const value = input.value.trim();
    if ((event.key === 'Enter' || event.key === ',') && value) {
      control.push(this.fb.control(value));
      input.value = '';
      event.preventDefault();
    }
  }

  removeTag(control: FormArray, index: number) {
    control.removeAt(index);
  }

  // --- Hourly Rate Helpers ---
  extractAmount(rate?: string): string | null {
    return rate ? rate.split(' ')[0] : null;
  }

  extractCurrency(rate?: string): string | null {
    const match = rate?.match(/([A-Z]{3})/);
    return match ? match[1] : null;
  }

  extractUnit(rate?: string): string | null {
    const match = rate?.match(/per\s+(\w+)/i);
    return match ? match[1] : null;
  }

  onSave() {
    if (this.profileForm.invalid) return;

    const val = this.profileForm.value;
    const updatedProfile: TrainerProfile = {
      certifications: this.profile?.certifications ?? [],
      coverImage: this.profile?.coverImage ?? this.employee.coverImage,
      employeeId: this.profile?.employeeId ?? this.employee.id,
      firstname: this.profile?.firstname ?? this.employee.firstname,
      image: this.profile?.image ?? this.employee.image,
      lastname: this.profile?.lastname ?? this.employee.lastname,
      rating: this.profile?.rating ?? 0,
      totalReviews: this.profile?.totalReviews ?? 0,
      trainerVideoIntro: this.profile?.trainerVideoIntro ?? '',
      headline: val.headline.trim(),
      bio: val.bio.trim(),
      specialties: this.specialties.value,
      languages: this.languages.value,
      hourlyRate: `${val.hourlyRateAmount} ${val.hourlyRateCurrency} per ${val.hourlyRateUnit}`,
      availability: val.availability.trim(),
      website: val.website,
      linkedIn: val.linkedIn,
      youtube: val.youtube,
      isPublicProfile: val.isPublicProfile
    };

    this.trainerService.updateProfile(updatedProfile).subscribe({
      next: (res) => {
        this.profile = res;
        this.isEditing = false;
        this.alertService.successMessage('Profile updated successfully', 'Success');
      },
      error: err => this.alertService.errorMessage(err.message, 'Failed to update profile')
    });
  }

  getCharCount(controlName: string): number {
    return this.profileForm.get(controlName)?.value?.length ?? 0;
  }
}
