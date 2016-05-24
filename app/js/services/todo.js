var app = angular.module('app');

app.factory('todoService', ['$http', '$timeout', function($http, $timeout){
    var todos = [
        {
            name: '打酱油'
        },
        {
            name: '买烟'
        }
    ];
    //'Accept-Encoding': 'gzip'
    var loadTodoList = function(){
        return $http({
            url: 'http://localhost:3030/test',
            method: 'get',
            headers: {
                'Accept-Encoding': 'gzip'
            }
        }).then(function(){
            return todos;
        })
    };
    var addTodo = function(todo){
        todos.push(todo);
    };
    var removeTodos = function(ts){
        return todos = todos.filter(function(todo){
            return ts.indexOf(todo) < 0;
        })
    };
    return {
        loadTodoList: loadTodoList,
        addTodo: addTodo,
        remove: removeTodos
    }
}]);