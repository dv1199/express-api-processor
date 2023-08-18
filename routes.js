const express = require('express');
const router = express.Router();
const cron = require('node-cron');

var orders = [];

function getCurrentISTTime() {
    const date = new Date();
    const offset = date.getTimezoneOffset() == 0 ? 0 : -1 * date.getTimezoneOffset();
    let normalized = new Date(date.getTime() + (offset) * 60000);
    let currentISTTime = new Date(normalized.toLocaleString("en-US", {timeZone: "Asia/Calcutta"}));
    return currentISTTime;
}

function getSplitFromTime(time) {
    const orderDate = new Date(time);
    let orderHours = orderDate.getUTCHours();
    orderHours = orderHours < 10 ? `0${orderHours}` : orderHours;
    let orderMinutes = orderDate.getUTCMinutes();
    orderMinutes = orderMinutes < 10 ? `0${orderMinutes}` : orderMinutes;
    let orderSeconds = orderDate.getUTCSeconds();
    orderSeconds = orderSeconds < 10 ? `0${orderSeconds}` : orderSeconds;
    return `${orderHours}:${orderMinutes}:${orderSeconds}`;
}

function printOrders(ordered) {
    console.log("ORDER_TIME  KITCHEN_RECEIVING_TIME  ORIGIN  ORDER_ID")
    if (ordered) {
        orders = orders.sort((order1,order2) => (new Date(order1.order_time) > new Date(order2.order_time)) ? 1 : ((new Date(order2.order_time) > new Date(order1.order_time)) ? -1 : 0))
    }
    orders.forEach((order) => {
        const orderTime = getSplitFromTime(order.order_time);
        const kitchenTime = getSplitFromTime(order.kitchen_receiving_time);
        console.log(`${orderTime} - ${kitchenTime} - ${order.order_origin} - ${order.order_id}`);
    })
}

// run every 1 minute
cron.schedule('*/5 * * * *', () => {
    console.log("*** Order in which kitchen received the order: ");
    printOrders(ordered=false);
    console.log("*** Order in which kitchen processed the order: ");
    printOrders(ordered=true);
    console.log("********");
    orders = [];
});

console.log("Cron job started");

/* Endpoint to send an order to the restaurant kitchen */
router.post('/', async (req, res, next) => {
    try {
        const orderData = req.body;
        console.log("Order received in the kitchen: ", orderData);
        orders.push(orderData);
    } 
    catch (error) {
        console.log("Error: ", error);
        next(error);
    }
});

module.exports = router;