export class OrderRequest {
  constructor() {
    this.shippingCost = 0;
    this.amount = 0;
    this.status = '';
    this.shippingAddress = '';
    this.userId = 0;
    this.orderItems = [];
  }
}

export class OrderUpdateRequest {
  constructor() {
    this.shippingCost = 0;
    this.status = '';
    this.shippingAddress = '';
  }
}
/////
export class OrderResponse {
  constructor() {
    this.id = 0;
    this.orderNumber = '';
    this.shippingCost = 0;
    this.amount = 0;
    this.status = '';
    this.createdAt = null;
    this.shippingAddress = '';
    this.user = new UserOrderResponse();
    this.orderItems = [];
  }
}
////
export class UserOrderResponse {
  constructor() {
    this.id = 0;
    this.name = '';
    this.phone = '';
  }
}