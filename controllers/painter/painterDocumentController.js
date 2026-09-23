const Document = require("../../models/superadmin/documentModel");

// GET PAINTER DOCUMENT CATEGORIES
exports.getPainterDocumentCategories = async (req, res) => {
    try {
        const documents = await Document.find({
            status: "PUBLISHED",
            accessTo: "PAINTERS",
        }).sort({ createdAt: -1 });

        const categories = [
            {
                value: "BROCHURE",
                label: "Product Brochure",
                documents: [],
            },
            {
                value: "COLOUR_PALETTE",
                label: "Colour Palette",
                documents: [],
            },
            {
                value: "PRICE_LIST",
                label: "Price List",
                documents: [],
            },
            {
                value: "PRODUCT_CATALOGUE",
                label: "Product Catalogue",
                documents: [],
            },
            {
                value: "TECHNICAL_DATA_SHEET",
                label: "Technical Data Sheet",
                documents: [],
            },
            {
                value: "WARRANTY",
                label: "Warranty",
                documents: [],
            },
            {
                value: "APPLICATION_GUIDE",
                label: "Application Guide",
                documents: [],
            },
            {
                value: "MARKETING_MATERIALS",
                label: "Marketing Material",
                documents: [],
            },
        ];

        documents.forEach((document) => {
            const category = categories.find(
                (item) => item.value === document.category
            );

            if (category) {
                category.documents.push({
                    _id: document._id,
                    documentName: document.documentName,
                    fileName: document.fileName,
                    fileUrl: document.fileUrl,
                    fileType: document.fileType,
                    fileSize: document.fileSize,
                    description: document.description,
                    downloadCount: document.downloadCount,
                    createdAt: document.createdAt,
                });
            }
        });

        res.status(200).json({
            success: true,
            count: documents.length,
            categories,
        });
    } catch (error) {
        console.error(
            "Get painter document categories error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch painter document categories",
        });
    }
};