var arr = [1, 2]
arr.map(function(){
    console.log(arr)
    arr.splice(0, 1, undefined)
})
