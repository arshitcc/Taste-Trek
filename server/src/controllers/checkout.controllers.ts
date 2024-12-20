import Stripe from "stripe";
import { APP_URL, STRIPE_SECRET_KEY } from "../utils/env";
import { CustomRequest } from "../models/users.model";
import { Response } from "express";
import { ICart } from "../models/cart.model";
import { ICartItem, IOrder, Order } from "../models/orders.model";
import { IAddress } from "../models/users.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";


const stripe = new Stripe(STRIPE_SECRET_KEY as string);

interface CreateCheckoutSessionRequest {
    cart : ICart;
    deliveryAddress: IAddress;
}

const createCheckoutSession = async (req: CustomRequest, res: Response) => {
    
    const { cart, deliveryAddress } : CreateCheckoutSessionRequest  = req.body;
    const {restaurantId} = req.body;

    const order : IOrder = await Order.create({
        userId  : req.user._id,
        restaurantId,
        items : cart.items,
        totalAmount : 5432,
        deliveryAddress,
        orderPlacedAt : new Date(),
        estimatedDeliveryTime : new Date(),
        status : "pending"
    });

    if(!order){
        throw new ApiError(500, `Failed to Initiate order`);
    }
    const items = cart.items;
    const lineItems = createLineItems(cart.items);

    const session = await stripe.checkout.sessions.create({
        payment_method_types : ['card'],
        shipping_address_collection: {
            allowed_countries : ['GB', 'US', 'IN']
        },
        line_items : lineItems,
        mode : 'payment',
        success_url : `${APP_URL}/order/status`,
        cancel_url : `${APP_URL}/carts/:${cart.restaurantId}`,
        metadata : {
            orderId : order._id.toString(),
        }
    });

    if(!session.url){
        throw new ApiError(500, `Failed to make payment session !!`);
    }

    await order.save({validateBeforeSave : false});

    return res.status(200)
    .json(new ApiResponse(200, `Stripe Payment Session got created Sucessfully !!.`, session));
}

const createLineItems = (items : ICart["items"]) => {
    const lineItems = items.map((item : ICartItem) => (
        {
            price_data : {
                currency : 'inr',
                product_data : {
                    name : item.name
                },
                unit_amount : item.price
            },
            quantity : item.quantity
        }
    ));

    return lineItems;
}

export { createCheckoutSession };
