import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Order } from "@prisma/client";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


@Injectable()
export class StripeService {
    constructor(private readonly configService: ConfigService) { }

    async createPaymentSession(order: any): Promise<any> {

        /**
ORDER :
{
    "id": "39b125be-3a89-4f97-ac1e-0d1fb1dfe77a",
    "amount": 2000,
    "taxAmount": 0,
    "totalAmount": 2000,
    "currency": "EUR",
    "status": "pending",
    "createdAt": "2023-12-06T09:51:46.889Z",
    "updatedAt": "2023-12-06T09:51:46.889Z",
    "userId": "137f9d82-9f35-439e-86b4-32e4a7b04a04",
    "cartId": "7536a99c-9e4a-4291-88b8-491490cb48d3",
    "addressId": "922a95fd-4935-46c8-ae92-6b99c90ad4d0",
    "Cart": {
        "id": "7536a99c-9e4a-4291-88b8-491490cb48d3",
        "createdAt": "2023-12-06T09:39:01.317Z",
        "updatedAt": "2023-12-06T09:39:01.317Z",
        "userId": "137f9d82-9f35-439e-86b4-32e4a7b04a04",
        "CartItem": [
            {
                "id": "54326e79-7f28-45ff-8ffc-babf410dd3d3",
                "createdAt": "2023-12-06T09:48:53.469Z",
                "updatedAt": "2023-12-06T09:48:53.469Z",
                "cartId": "7536a99c-9e4a-4291-88b8-491490cb48d3",
                "itemId": "ff56783b-6517-46a8-b5c8-315213ae8a0c",
                "Item": {
                    "id": "ff56783b-6517-46a8-b5c8-315213ae8a0c",
                    "name": "Super Mario 64",
                    "description": "Pour Nintendo 64, le jeu marche très bien !",
                    "state": "Bon état",
                    "price": "20",
                    "images": [
                        "https://upload.wikimedia.org/wikipedia/en/6/6a/Super_Mario_64_box_cover.jpg"
                    ],
                    "isVisible": true,
                    "createdAt": "2023-12-06T09:48:40.048Z",
                    "updatedAt": "2023-12-06T09:48:40.048Z",
                    "userId": "137f9d82-9f35-439e-86b4-32e4a7b04a04"
                }
            }
        ]
    }
}
         */

        const line_items = order.Cart.CartItem.map((_item: any) => {
            return {
                price_data: {
                    currency: order.currency,
                    product_data: {
                        name: _item.Item.name,
                        description: _item.Item.description
                    },
                    unit_amount: _item.Item.price * 100,
                },
                quantity: 1,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: this.configService.get('STRIPE_SUCCESS_URL'),
            cancel_url: this.configService.get('STRIPE_CANCEL_URL'),
        });

        return session;
    }

    async getPaymentSession(paymentSessionId: string): Promise<any> {
        const session = await stripe.checkout.sessions.retrieve(paymentSessionId);
        return session;
    }

}
