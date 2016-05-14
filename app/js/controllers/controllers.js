var app = angular.module('app');

app.controller('todoCtrl', ['$scope', '$location', 'todoService', function($scope, $location, todoService){
    $scope.todoList = todoService.loadTodoList();
    $scope.removeArr = [];
    $scope.todo = {name: ''};
    $scope.onSubmit = function(){
        todoService.addTodo($scope.todo);
        $location.path('/todo');
    };
    $scope.onSelectTodo = function(o){
        var i = $scope.removeArr.indexOf(o);
        if(i>=0){
            return $scope.removeArr.splice(i, 1);
        }
        $scope.removeArr.push(o);
    };
    $scope.onComplete = function(){
        $scope.todoList = todoService.remove($scope.removeArr);
    }
}]);