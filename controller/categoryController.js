const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const categoryModel = require("../models/categoryModels");

// استرجاع الفئات مع دعم التصفح (Pagination)
exports.getCategories = asyncHandler(async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 5;

  if (page < 1) page = 1;
  if (limit < 1) limit = 5;

  const skip = (page - 1) * limit;
  const categories = await categoryModel.find({}).skip(skip).limit(limit);

  res.status(200).json({ results: categories.length, page, data: categories });
});

// إنشاء فئة جديدة مع التحقق من الإدخال
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const category = await categoryModel.create({
    name,
    slug: slugify(name, { lower: true, strict: true }),
  });
  res.status(201).json({ data: category });
});