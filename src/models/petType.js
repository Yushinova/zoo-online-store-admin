export class PetTypeRequest {
  constructor() {
    this.name = '';
    this.imageName = '';
  }
}
export class PetTypeUpdateRequest{
  constructor(){
    this.id=0;
    this.name='';
    this.categoriesIds=[];
  }
}
export class PetTypeResponse{
  constructor() {
    this.id = 0;
    this.name = '';
    this.imageName = '';
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