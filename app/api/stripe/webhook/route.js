import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set.");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.userId;
      const customerId = session.customer;

      if (!userId) {
        console.error("No client_reference_id or metadata.userId found in session");
        return NextResponse.json({ error: "No userId provided" }, { status: 400 });
      }

      await db.user.upsert({
        where: { id: userId },
        update: {
          stripeCustomerId: customerId,
          subscriptionTier: "job_search",
          subscriptionStatus: "active",
        },
        create: {
          id: userId,
          email: session.customer_details?.email || "placeholder@example.com",
          stripeCustomerId: customerId,
          subscriptionTier: "job_search",
          subscriptionStatus: "active",
        },
      });

      console.log(`User ${userId} upgraded to job_search tier via checkout`);
    } else if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.canceled") {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const user = await db.user.findUnique({ where: { stripeCustomerId: customerId } });
      
      if (user) {
        await db.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionTier: "free",
            subscriptionStatus: "canceled",
          },
        });
        console.log(`User ${user.id} subscription canceled. Downgraded to free.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    );
  }
}
