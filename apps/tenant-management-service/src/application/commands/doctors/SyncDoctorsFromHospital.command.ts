export class SyncDoctorsFromHospitalCommand {
  constructor(
    public readonly externalHospitalCode: string,
    public readonly date: string, // Ngày để lấy lịch khám
  ) {}
}