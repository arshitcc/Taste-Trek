class ApiResponse {
  constructor(
    public statusCode: number,
    public message: string = "Success",
    public data: Object,
    public success?: boolean
  ) {
    this.success = statusCode < 400;
  }
}

export { ApiResponse};
