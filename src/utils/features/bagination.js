export const bagination=async({page,model,populate=[]}) => {
    let _page=+page||1
    if(_page<1) _page=1
     const limit=2
     let skip=(_page-1)*limit
    let data=await model.find({isdeleted:{$exists:false}}).populate(populate).limit(limit).skip(skip)
    return {data,_page}
}