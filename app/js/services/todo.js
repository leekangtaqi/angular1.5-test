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
    var loadTodoList = function(){
        return todos
    };
    var addTodo = function(todo){
        todos.push(todo);
    };
    var removeTodos = function(ts){
        return todos = todos.filter(function(todo){
            return ts.indexOf(todo) < 0;
        })
    }
    return {
        loadTodoList: loadTodoList,
        addTodo: addTodo,
        remove: removeTodos
    }
}]);