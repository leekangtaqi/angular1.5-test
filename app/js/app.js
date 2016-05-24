var app = angular.module('app', ['ui.router']);

angular.element(document).ready(function(){
    console.log('module app dom ready.');
    angular.bootstrap(document, ['app']);
});

app.config(function($stateProvider, $urlRouterProvider){
    console.log('module app config invoked.');
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state('index', {
            url: '/',
            templateUrl: './app/templates/index.html',
            controller: ''
        })
        .state('todo', {
            url: '/todo',
            templateUrl: './app/templates/todo.html',
            redirectTo: 'todo.list'
        })
        .state('todo.list', {
            url: '/list',
            templateUrl: './app/templates/todo-list.html',
            controller: ''
        })
        .state('todo.list.nest', {
            url: '/nest',
            templateUrl: './app/templates/todo-nest.html',
            controller: ''
        })
        .state('todo.new', {
            url: '/new',
            templateUrl: './app/templates/todo-new.html',
            controller: 'todoCtrl'
        })
});

app.run(['$rootScope', '$state', function($rootScope, $state){
    console.log("module app is run.");

    $rootScope.$on('$stateChangeStart', function(evt, to, params) {
        if (to.redirectTo) {
            evt.preventDefault();
            $state.go(to.redirectTo, params, {location: 'replace'})
        }
    });
}]);