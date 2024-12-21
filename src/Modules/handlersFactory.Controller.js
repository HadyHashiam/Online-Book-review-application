const asyncHandler = require('express-async-handler');
const ApiError = require('../../utils/apiError');
const ApiFeatures = require('../../utils/apiFeatures');


exports.createOne = (Model, data) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(data);
    req.newDoc = newDoc
    // res.status(201).json({ data: newDoc });

  });



exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    req.document = document
    // Trigger "save" event when update document
    document.save();
    res.status(200).json({ data: document });
  });




exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // 1) Build query
    let query = Model.findById(id);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    // 2) Execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });



exports.getAll = (Model, modelName = '') =>

  asyncHandler(async (req, res) => {
    console.log(req.filterObj)
    console.log("1", Model)
    console.log("2", modelName)
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Build query
    const documentsCounts = await Model.countDocuments();
    console.log("Gell ALL RUN ");

    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      // .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;
    console.log("Found documents:", documents.length);

    req.results = documents.length;
    req.paginationResult = paginationResult;
    req.documents = documents;

    // res.status(200).json({ results: documents.length, paginationResult, items: documents });
  });




exports.deleteOne = (Model, data) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(data);

    if (!document) {
      return next(new ApiError(`No document for this id ${data}`, 404));
    }
    req.Doc = document

    // res.status(200).json({
    //   status: 'success',
    //   message: `Product by id: ${data} Deleted Successfully`,
    //   data: document
    // });
  });