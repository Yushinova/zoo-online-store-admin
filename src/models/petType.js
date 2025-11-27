export class PetTypeRequest {
  constructor() {
    this.name = '';
    this.imageName = '';
  }
}

export class PetTypeResponse{
  constructor() {
    this.id = 0;
    this.name = '';
    this.categories = []; 
  }
}
///
export class PetTypeShortResponse {
  constructor() {
    this.id = 0;
    this.name = '';
  }
}