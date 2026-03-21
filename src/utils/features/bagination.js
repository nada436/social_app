export const bagination = async ({ page, model, populate = [], filter = {} }, blocked_users = []) => {
    let _page = +page || 1;
    if (_page < 1) _page = 1;

    const limit = 2;
    let skip = (_page - 1) * limit;

    let data = await model.find({
        isdeleted: { $exists: false },
        user_id: { $nin: blocked_users },
        isArchived: 'false',
        ...filter  
    })
    .populate(populate)
    .limit(limit)
    .skip(skip);

    return { data, _page };
};