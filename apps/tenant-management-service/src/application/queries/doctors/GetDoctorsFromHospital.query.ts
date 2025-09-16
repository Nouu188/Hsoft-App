export class GetDoctorsFromHospitalQuery {
  constructor(
    public readonly graphqlEndpoint: string,
    public readonly clinicCode?: string,
    public readonly doctorCode?: string,
    public readonly date?: string,
  ) {}
}