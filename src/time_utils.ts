import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration);

export function getDurationMmSs(dateTimeFrom: dayjs.ConfigType, dateTimeTo: dayjs.ConfigType = new Date()): string {
    const duration = dayjs.duration(dayjs(dateTimeTo).diff(dateTimeFrom));
    const totalSeconds = duration.asSeconds();
    const minutes = Math.trunc(totalSeconds / 60);
    const seconds = Math.trunc(totalSeconds % 60);
    return minutes + ":" + (seconds > 9 ? seconds : "0" + seconds);
}