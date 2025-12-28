import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'secondsToTime',
    standalone: true
})
export class SecondsToTimePipe implements PipeTransform {

    transform(value: number | undefined): string {
        if (!value) return '00:00';

        // Ensure value is a number
        const seconds = Math.floor(value);

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        const hDisplay = h > 0 ? h + ':' : '';
        const mDisplay = (h > 0 && m < 10 ? '0' : '') + m + ':';
        const sDisplay = s < 10 ? '0' + s : s;

        return hDisplay + mDisplay + sDisplay;
    }
}
