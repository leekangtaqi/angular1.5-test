var app = angular.module('app');

app
    .controller('test', function($scope, $rootScope){
        var savedData = [];
        $scope.onSelect = function(){
            var offFn = $rootScope.$on('receive-ng-tree', function(e, data){
                offFn();
                if(data){
                    savedData.push(data);
                }
            });
            $rootScope.$broadcast('popup-ng-tree', savedData);
        }
    })
    .directive('todoList', function(){
        return {
            restrict: 'E',
            controller: 'todoCtrl',
            template: '<ul>' +
            '<li ng-repeat="todo in todoList">' +
                '<div><input type="checkbox" ng-click="onSelectTodo(this.todo)"/>{{todo.name}}<div>' +
            '</li>' +
            '</ul>'
        }
    })
    .controller('ngCascadeTreeCtrl', function($scope, $timeout, $rootScope){
        $rootScope.$on('popup-ng-tree', function(e, data){
            $scope.$broadcast('ng-tree-init', data);
            $scope.isShow = true;
        });
        $scope.onClick = function(){
            $scope.$broadcast('merge-to-request');
        };
        $scope.onCancel = function(){
            $rootScope.$broadcast('receive-ng-tree', null);
            $scope.isShow = false;
        };
        $scope.onSubmit = function(){
            var offFn = $scope.$on('submit-response', function(e, data){
                offFn();
                console.log('result is ........');
                console.warn(data.map(function(n){
                    return n.text + ' ' +  n.children.map(function(n1){
                            return n1.text + '(' + n1.children.map(function(n2){
                                    return n2.text
                                }).join(' , ') + ')'
                        }).join(' , ');
                }).join(' , '));
                $rootScope.$broadcast('receive-ng-tree', data);
                $scope.isShow = false;
            });
            $scope.$broadcast('submit-request');
        };
        $scope.$on('merge-to-response', function(e, data){
            $scope.$broadcast('merge-to-feedback', data);
        });
        $scope.$on('datasource-request', function(){
            var offFn = $scope.$on('datasource-response', function(e, data){
                $scope.$broadcast('datasource-feedback', data);
                offFn();
            });
            $scope.$broadcast('datasource-request-repeater');
        });
        $scope.$on('merge-back-request', function(e, data){
            $scope.$broadcast('merge-back-response', data);
        });
        $scope.mocks1 = [
            {
                id: '1',
                text: '北京市',
                children: [
                    {
                        id: '11',
                        text: '市区',
                        children: [
                            {
                                id: '111',
                                text: '东城区'
                            },
                            {
                                id: '112',
                                text: '西城区'
                            }
                        ]
                    },
                    {
                        id: '12',
                        text: '县',
                        children: [
                            {
                                id: '121',
                                text: '平谷县'
                            },
                            {
                                id: '122',
                                text: '怀柔县'
                            }
                        ]
                    }
                ]
            },
            {
                id: '2',
                text: '上海市',
                children: [
                    {
                        id: '21',
                        text: '市区',
                        children: [
                            {
                                id: '211',
                                text: '东城区'
                            },
                            {
                                id: '212',
                                text: '西城区'
                            }
                        ]
                    },
                    {
                        id: '22',
                        text: '县',
                        children: [
                            {
                                id: '221',
                                text: '平谷县'
                            },
                            {
                                id: '222',
                                text: '怀柔县'
                            }
                        ]
                    }
                ]
            }
        ];

        $scope.mocks2 = {
            id: '2',
            text: '上海市',
            children: [
                {
                    id: '21',
                    text: '市区',
                    children: [
                        {
                            id: '211',
                            text: 'ss'
                        },
                        {
                            id: '212',
                            text: 'xx'
                        }
                    ]
                },
                {
                    id: '22',
                    text: '县',
                    children: [
                        {
                            id: '221',
                            text: 'ttt'
                        },
                        {
                            id: '222',
                            text: 'bb'
                        }
                    ]
                }
            ]
        }
    })
    .directive('ngTree', function($compile){
        return {
            restrict: 'E',
            scope: {},
            template:
                '<div class="ng-tree-container">' +
                    '<div class="ng-tree-header" ng-if="title">' +
                        '{{title}}' +
                    '</div>' +
                    '<div class="ng-tree-body">' +
                        '<ul>' +

                        '</ul>' +
                    '</div>' +
                '</div>'
            ,
            replace: true,
            link: function($scope, $el, $attrs) {
                $scope.metaMap = {};
                $scope.valueMap = {};
                $scope.foldIcon = $attrs['foldicon'];
                $scope.fileIcon = $attrs['fileicon'];
                $scope.title = $attrs['title'];
                $scope.id = $attrs.id || 'id';
                $scope.role = $attrs['role'];
                $scope.canRemove = !!$attrs.remove || false;
                $scope.onClick = function (e, id) {
                    if($scope.role === 'secondary'){
                        return;
                    }
                    var meta = $scope.metaMap[id];
                    var data = meta.data;
                    var selected = !(!!meta.data.selected);
                    var isNotLeaf = !!meta.data.children;
                    if(isNotLeaf){
                        function recursiveSelect(n){
                            if(!n.children){
                                return;
                            }
                            n.children.map(function(t){
                                if(t && t.children){
                                    return recursiveSelect(t)
                                }
                                t.selected = selected;
                            })
                        }
                        recursiveSelect(data);
                    }else{
                        data.selected = selected;
                    }
                    e.stopPropagation();
                };
                $scope.onToggle = function(e, id){
                    var state = null;
                    var target = $scope.metaMap[id].data;
                    if(!target.children){
                        return;
                    }
                    state = !(!!target.children[0].show);
                    recurToggle(id, state);
                    function recurToggle(id, state){
                        if(!id){
                            return;
                        }
                        var target = $scope.metaMap[id].data;
                        if(!target.children){
                            return;
                        }
                        target.children.forEach(function(n){
                            n.show = state;
                            recurToggle(n.id, state);
                        });
                    }
                    e.stopPropagation();
                };
                $scope.onRemove = function(id, e){
                    function recursiveRemove(id, directive){
                        if(!id || !$scope.metaMap[id] || !$scope.metaMap[id].data){
                            return;
                        }
                        $scope.metaMap[id].data.none = true;
                        if($scope.metaMap[id].data
                            && $scope.metaMap[id].data.children
                            && (directive === 'down' || directive === 'both')
                        ){
                            $scope.metaMap[id].data.children.map(function(n){
                                return recursiveRemove(n.id, 'down')
                            })
                        }
                        if($scope.metaMap[id].parent){
                            var parent = $scope.metaMap[id].parent;
                            if($scope.metaMap[parent.id]
                                && $scope.metaMap[parent.id].data.children
                                && (directive === 'up' || directive === 'both')
                            ){
                                if($scope.metaMap[parent.id].data.children.filter(function(n){
                                    return !n.none
                                }).length <= 0){
                                    recursiveRemove(parent.id, 'up')
                                }
                            }
                        }
                    }
                    recursiveRemove(id, 'both');
                    $scope.$emit('merge-back-request', id);
                    e.stopPropagation();
                };
                $scope.onValidateSelected = function(id){
                    if(!$scope.metaMap[id] || !$scope.metaMap[id].data){
                        return;
                    }
                    var meta = $scope.metaMap[id].data;
                    if(meta && meta.children){
                        var aliveArr = meta.children.filter(function(t){
                            return !t.hasOwnProperty('none') || !t.none
                        });

                        var res = aliveArr.filter(function(t){
                                    return !t.hasOwnProperty('none') || !t.none
                                })
                                .map(function(t){
                                    return t.selected || false
                                }).filter(function(t){
                                    return t
                                }).length === aliveArr.length;
                        meta.selected = res;
                    }
                    return $scope.metaMap[id].data.selected;
                };
                $scope.$on('submit-request', function(e){
                    if($scope.role === 'secondary'){
                        var res = Object.keys($scope.metaMap).filter(function(m){
                            return !$scope.metaMap[m].data.none
                        }).map(function(id){
                            if($scope.valueMap[id].data
                            ){
                                if($scope.valueMap[id].data.hasOwnProperty('children')){
                                    delete $scope.valueMap[id].data['children']
                                }
                            }
                            var o = $scope.valueMap[id].data;
                            o.parent = $scope.valueMap[id].parent;
                            return o;
                        });
                        var o = res.reduce(function(a, c){
                            a[c.id] = c;
                            return a;
                        }, {});
                        res.forEach(function(n){
                            if(n.parent){
                                if(!o[n.parent].children){
                                    o[n.parent].children = [];
                                }
                                o[n.parent].children.push(n);
                            }
                        });
                        var data = Object.keys(o).map(function(n){
                            if(!o[n].parent){
                                return o[n];
                            }
                            return null;
                        }).filter(function(n){
                            return n
                        });
                        $scope.$emit('submit-response', data);
                    }
                });
                $scope.$on('merge-back-response', function(e, id){
                    if($scope.role === 'primary'){
                        function recursiveDownNotNone(id, directive){
                            if(!id){
                                return;
                            }
                            $scope.metaMap[id].data.none = false;
                            if($scope.metaMap[id].data
                                && $scope.metaMap[id].data.children
                                && (directive === 'both' || directive === 'down')
                            ){
                                $scope.metaMap[id].data.children.map(function(n){
                                    n.none = false;
                                    n.selected  = false;
                                    recursiveDownNotNone(n.id, 'down');
                                })
                            }
                            if($scope.metaMap[id].data
                                && $scope.metaMap[id].parent
                                && (directive === 'both' || directive === 'up')
                            ){
                                var parentId = $scope.metaMap[id].parent.id;
                                $scope.metaMap[parentId].data.none = false;
                                $scope.metaMap[parentId].data.selected  = false;
                                recursiveDownNotNone($scope.metaMap[parentId].parent && $scope.metaMap[parentId].parent.id, 'up');
                            }
                        }
                        recursiveDownNotNone(id, 'both');
                    }
                });
                $scope.$on('merge-to-feedback', function(e, ids){
                    if($scope.role === 'secondary'){
                        ids.forEach(function(id){
                            function recurUpdateNone(id){
                                if(!id){
                                    return;
                                }
                                $scope.metaMap[id].data.none = false;
                                $scope.metaMap[id].data.selected = false;
                                if($scope.metaMap[id].parent){
                                    recurUpdateNone($scope.metaMap[id].parent.id || $scope.metaMap[id].parent);
                                }
                            }
                            recurUpdateNone(id);
                        })
                    }
                });
                $scope.$on('datasource-request-repeater', function(e){
                    if($scope.role === 'primary'){
                        $scope.$emit('datasource-response', {
                            vm: $scope.valueMap,
                            om: $scope.dataSource
                        });
                    }
                });
                $scope.$on('merge-to-request', function(e){
                    if($scope.role === 'primary'){
                        //filter selected
                        //emit selected data(stringified)
                        var selected = [];
                        Object.keys($scope.metaMap).map(function(k){
                            var meta = $scope.metaMap[k];
                            var data = meta.data;
                            if(data.selected){
                                //stringify data
                                selected.push(data.id);
                                data.selected = false;
                                data.none = true;
                            }
                        });
                        //delete selected
                        $scope.$emit('merge-to-response', selected);
                    }
                });
                $scope.$on('ng-tree-init', function(e, data){
                    $scope.init(data);
                });
                $scope.init = function(data){
                    if (!$attrs.label) {
                        $scope.label = $attrs['label'];
                        throw new Error('ng-tree directive expected a label attribute');
                    }

                    if($attrs.datasource){
                        try {
                            $scope.dataSource = JSON.parse($attrs.datasource);
                            $scope.dataSource = deepClone({}, $scope.dataSource);
                        } catch (e) {
                            throw new Error('ng-tree directive expected a data source attribute');
                        }
                        if(!Array.isArray($scope.dataSource)){
                            $scope.dataSource = {
                                children: [$scope.dataSource]
                            };
                        }else{
                            $scope.dataSource = {
                                children: $scope.dataSource
                            }
                        }

                        mapDataSource($scope.dataSource, $scope.metaMap);

                        deepMapDataSource($scope.dataSource, $scope.valueMap);

                        if($scope.role === 'primary'){
                            Object.keys($scope.metaMap).forEach(function(k){
                                $scope.metaMap[k].data.none = false;
                                $scope.metaMap[k].data.selected = false;
                            })
                        }

                        if($scope.role === 'secondary'){
                            Object.keys($scope.metaMap).forEach(function(k){
                                $scope.metaMap[k].data.none = true;
                                $scope.metaMap[k].data.selected = false;
                            })
                        }

                        if(data && Object.keys(data).length > 0){
                            var isNestArray = Array.isArray(data[0]);
                            var meta = {};
                            var keys = [];
                            //preload
                            if(isNestArray){
                                var leafs = [];
                                var leafsArr = data.map(function(state){
                                    //merge
                                    var m ={};
                                    mapDataSource(state, m);
                                    return Object.keys(m).map(function(k){
                                        return m[k]
                                    }).filter(function(n){
                                        var data = n.data || n;
                                        return !data.children
                                    });
                                }).forEach(function(ar){
                                    ar.forEach(function(leaf){
                                        leafs.push(leaf);
                                    });
                                });
                                var arr = [];
                                var tmps = [];
                                composeCompleteTree(leafs, arr);

                                data = arr;
                                function composeCompleteTree(leafs, arr){
                                    leafs.forEach(function(leaf){
                                        recur(leaf);
                                    });
                                    function recur(leaf){
                                        if(!leaf){
                                            return;
                                        }
                                        if(leaf.parent && leaf.parent.id || leaf.parent){
                                            var meta = $scope.metaMap[leaf.parent.id || leaf.parent];
                                            var data = meta.data;
                                            var part = null;
                                            var me = null;
                                            var idx = tmps.map(function(tmp){return tmp.id;}).indexOf(leaf.id || leaf.data.id);
                                            if(idx >= 0){
                                                me = tmps.slice(idx, idx+1)[0];
                                            }else{
                                                me = {
                                                    id: leaf.id || leaf.data.id,
                                                    text: leaf.text || leaf.data.text,
                                                    parent: data && data.id || null
                                                };
                                                tmps.push(me);
                                            }
                                            var index = tmps.map(function(tmp){return tmp.id;}).indexOf(data.id);
                                            if(index >= 0){
                                                part = tmps.slice(index, index+1)[0];
                                                part.children.push(me);
                                            }else{
                                                part = {
                                                    id: data.id,
                                                    text: data.text,
                                                    parent: meta.parent && meta.parent.id || meta.parent || null
                                                };
                                                part.children = [];
                                                part.children.push(me);
                                                tmps.push(part);
                                            }
                                            recur(part);
                                        }else{
                                            arr.push(leaf);
                                        }
                                    }
                                }
                            }

                            mapDataSource(data, meta);

                            keys = Object.keys(meta).map(function(k){
                                return k;
                            });

                            if($scope.role === 'primary'){
                                var roots = Object.keys($scope.metaMap).map(function(k){
                                    return $scope.metaMap[k]
                                }).filter(function(n){
                                    var data = n.data || n;
                                    return keys.indexOf(data.id) >= 0 && !n.parent
                                });
                                if(roots && roots.length){
                                    for(var i= 0, len=roots.length; i< len; i++){
                                        recursiveCheck(roots[i]);
                                    }
                                }

                                function recursiveCheck(node){
                                    if(!node){
                                        return;
                                    }
                                    var children = node.children || node.data && node.data.children;
                                    if(children){
                                        var t = children.map(function(c){
                                            return recursiveCheck(c)
                                        }).filter(function(b){
                                            return b;
                                        });
                                        if(t.length === children.length){
                                            var d = node.data || node;
                                            d.none = true;
                                            return true;
                                        }
                                        return false;
                                    }else{
                                        var data = node.data || node;
                                        if(keys.indexOf(data.id) >= 0){
                                            data.none = true;
                                            return true;
                                        }
                                        return false;
                                    }
                                }
                            }else{
                                Object.keys($scope.metaMap).forEach(function(k){
                                    //if(keys.indexOf(k) >= 0){
                                      $scope.metaMap[k].data.none = true;
                                    //}
                                })
                            }
                        }

                        render();
                    }
                };
                $scope.init();
                function render(){
                    function recurCompose(node, level){
                        if(!node.data){
                            return;
                        }
                        var html = '';
                        if(node.data.children){
                            node.data.children.forEach(function(n){
                                html += '<li class="ng-tree-li-level-' + level + '" ng-show="!metaMap[' + n.id + '].data.show" ng-class="{ngTreeItemSel: onValidateSelected(' + n.id + ')}" ng-click="onClick($event, ' + n.id + ')" key=' + n.id + ' ng-if="!metaMap[' + n.id + '].data.none">' +
                                '<div>' +
                                '<b ng-if="metaMap[' + n.id + '].data.children" class="ng-tree-toggle" ng-click="onToggle($event, '+ n.id + ')"></b>' +
                                '<span>' + n.text + '</span>' +
                                '<b ng-click="onRemove('+ n.id +', $event)" class="ng-tree-remove" ng-if="canRemove">' +
                                '</b>' +
                                '</div>';
                                if(n.children){
                                    html += '<ul>' +
                                    recurCompose({data: n, scope: node.scope, f: 'this'}, level+1) +
                                        '</ul>'
                                }
                            });
                            html += '</li>';
                        }
                        return html;
                    }
                    var res = recurCompose({data: $scope.dataSource, scope: $scope, f: 'dataSource'}, 1);
                    $el.find('.ng-tree-body >ul').empty().append($compile(res)($scope));
                }
                function deepMapDataSource(data, val){
                    if(!Array.isArray(data)){
                        data = data.children;
                    }
                    function recur(ar, root){
                        ar.map(function(n){
                            val[n.id] = {

                                data: {
                                    id: n.id,
                                    text: n.text,
                                    children: n.children && n.children.map(function(c){
                                        return c.id
                                    })
                                },
                                parent: root && root.id || null
                            };
                            if(n.children){
                                recur(n.children, n);
                            }
                        })
                    }
                    recur(data, null);
                }
                function mapDataSource(data, meta){
                    if(!Array.isArray(data)){
                        data = data.children;
                    }
                    function recur(ar, root){
                        ar.map(function(n){
                            meta[n.id] = {
                                data: n,
                                parent: root
                            };
                            if(n.children){
                                recur(n.children, n);
                            }
                        })
                    }
                    recur(data, null);
                }
                function deepClone(root, o){
                    if(Array.isArray(o)){
                        root = o.map(function(i){
                            if(typeof o === 'object'){
                                return deepClone({}, i)
                            }
                            return i;
                        });
                        return root;
                    }
                    else if(typeof o === 'object'){
                        for(var p in o){
                            root[p] = deepClone({}, o[p]);
                        }
                        return root;
                    }
                    else{
                        root = o;
                        return root;
                    }
                }
                function walkState(arr, fn) {
                    !Array.isArray(arr) && (arr = arr.children);
                    if (!arr || !arr.length) {
                        return;
                    }
                    return arr.map(function (state) {
                        var res = fn(state);
                        if (res) {
                            return res;
                        }
                        if(state.children){
                            return walkState(state.children, fn);
                        }
                    }).reduce(function(a, c){
                        return c ? c : a;
                    }, undefined);
                }
            }
        }
    });

