export class AdminRequest {
  constructor() {
    this.name = '';
    this.login = '';
    this.password = '';
  }
}

export class AdminLoginRequest {
  constructor() {
    this.login = '';
    this.password = '';
  }
}
///
export class AdminResponse {
  constructor() {
    this.name = '';
    this.login = ''
  }
}