const DealerCart = require("../../models/dealer/DealerCart");
const Product = require("../../models/superadmin/Product");

// ==========================================
// GET DEALER CART
// ==========================================

const getDealerCart = async (req, res) => {
  try {
    const dealerId = req.user.userId;

    const cart = await DealerCart.findOne({
      dealer: dealerId,
    }).populate("items.product");

    res.status(200).json({
      success: true,
      cart: cart || {
        dealer: dealerId,
        items: [],
      },
    });
  } catch (error) {
    console.error("Get dealer cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

// ==========================================
// ADD PRODUCT TO CART
// ==========================================

const addToCart = async (req, res) => {
  try {
    const dealerId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "This product is not available",
      });
    }

    if (product.stockQuantity < Number(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity is not available in stock",
      });
    }

    let cart = await DealerCart.findOne({
      dealer: dealerId,
    });

    if (!cart) {
      cart = new DealerCart({
        dealer: dealerId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + Number(quantity);

      if (newQuantity > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock",
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
      });
    }

    await cart.save();

    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================

const updateCartItem = async (req, res) => {
  try {
    const dealerId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (Number(quantity) > product.stockQuantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    const cart = await DealerCart.findOne({
      dealer: dealerId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    item.quantity = Number(quantity);

    await cart.save();

    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update cart item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};

// ==========================================
// REMOVE PRODUCT FROM CART
// ==========================================

const removeFromCart = async (req, res) => {
  try {
    const dealerId = req.user.userId;
    const { productId } = req.params;

    const cart = await DealerCart.findOne({
      dealer: dealerId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    await cart.save();

    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
      error: error.message,
    });
  }
};

// ==========================================
// CLEAR DEALER CART
// ==========================================

const clearCart = async (req, res) => {
  try {
    const dealerId = req.user.userId;

    const cart = await DealerCart.findOne({
      dealer: dealerId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

module.exports = {
  getDealerCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};