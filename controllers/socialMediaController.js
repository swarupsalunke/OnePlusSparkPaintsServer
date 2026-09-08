const SocialMediaPost = require("../models/SocialMediaPost");

// =====================================================
// CREATE POST
// =====================================================

const createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      platform,
      campaign,
      postType,
      scheduledDateTime,
      postedDateTime,
      status,
      engagement,
      isPaidCampaign,
      paidCampaignDetails,
    } = req.body;

    const post = new SocialMediaPost({
      title,
      content,
      platform,
      campaign,
      postType,
      scheduledDateTime: scheduledDateTime || null,
      postedDateTime: postedDateTime || null,
      status,
      engagement: engagement
        ? JSON.parse(engagement)
        : undefined,
      isPaidCampaign:
        isPaidCampaign === "true" || isPaidCampaign === true,
      paidCampaignDetails: paidCampaignDetails
        ? JSON.parse(paidCampaignDetails)
        : undefined,

      // Uploaded image
      image: req.file
        ? `/uploads/documents/${req.file.filename}`
        : "",
    });

    const savedPost = await post.save();

    res.status(201).json({
      success: true,
      message: "Social media post created successfully",
      data: savedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET ALL POSTS
// =====================================================

const getPosts = async (req, res) => {
  try {
    const {
      search,
      platform,
      status,
      campaign,
      postType,
      isPaidCampaign,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { campaign: { $regex: search, $options: "i" } },
      ];
    }

    if (platform) {
      filter.platform = platform;
    }

    if (status) {
      filter.status = status;
    }

    if (campaign) {
      filter.campaign = {
        $regex: campaign,
        $options: "i",
      };
    }

    if (postType) {
      filter.postType = postType;
    }

    if (isPaidCampaign !== undefined) {
      filter.isPaidCampaign =
        isPaidCampaign === "true";
    }

    const sortOrder = order === "asc" ? 1 : -1;

    const posts = await SocialMediaPost.find(filter).sort({
      [sortBy]: sortOrder,
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET POST BY ID
// =====================================================

const getPostById = async (req, res) => {
  try {
    const post = await SocialMediaPost.findById(
      req.params.id
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// UPDATE POST
// =====================================================

const updatePost = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    if (req.body.engagement) {
      updateData.engagement =
        typeof req.body.engagement === "string"
          ? JSON.parse(req.body.engagement)
          : req.body.engagement;
    }

    if (req.body.paidCampaignDetails) {
      updateData.paidCampaignDetails =
        typeof req.body.paidCampaignDetails === "string"
          ? JSON.parse(req.body.paidCampaignDetails)
          : req.body.paidCampaignDetails;
    }

    if (req.body.isPaidCampaign !== undefined) {
      updateData.isPaidCampaign =
        req.body.isPaidCampaign === "true" ||
        req.body.isPaidCampaign === true;
    }

    // New image uploaded
    if (req.file) {
      updateData.image =
        `/uploads/documents/${req.file.filename}`;
    }

    const updatedPost =
      await SocialMediaPost.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Social media post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// DELETE POST
// =====================================================

const deletePost = async (req, res) => {
  try {
    const deletedPost =
      await SocialMediaPost.findByIdAndDelete(
        req.params.id
      );

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Social media post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// POST STATUS OVERVIEW
// =====================================================

const getPostStatusOverview = async (req, res) => {
  try {
    const overview = await SocialMediaPost.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const totalPosts =
      await SocialMediaPost.countDocuments();

    res.status(200).json({
      success: true,
      totalPosts,
      data: overview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// TOP PERFORMING POSTS
// =====================================================

const getTopPerformingPosts = async (req, res) => {
  try {
    const posts = await SocialMediaPost.find()
      .sort({
        "engagement.views": -1,
      })
      .limit(5);

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostStatusOverview,
  getTopPerformingPosts,
};