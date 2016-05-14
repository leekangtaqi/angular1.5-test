var app = angular.module('app');

app.directive('todoList', function(){
    return {
        restrict: 'E',
        controller: 'todoCtrl',
        template: '<ul>' +
        '<li ng-repeat="todo in todoList">' +
            '<div><input type="checkbox" ng-click="onSelectTodo(this.todo)"/>{{todo.name}}<div>' +
        '</li>' +
        '</ul>'
    }
});