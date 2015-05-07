myApp.directive("dyTreeGrid", ['$http', '$compile', function ($http, $compile) {

    return {
        restrict: 'AE',
        replace: true,

        /**
         * template 介绍
         */
        // 最开始的 替换.
        // 使用 ng-repeat
        // 最开始的数据是 parentData 下面有定义. 如果 第一批 需要动态加载.有两种办法.
        //      1: 使用 scope.$watch
        //      2: http get/post 获得. 然后 通过 push 的方式 放入 ng-repeat 所使用的 数据集里面

        // showSon() 这个方法传入的数据.
        //      1. datas.id 这个是 下面显示使用的 parentId,
        //
        // id 的作用. id 主要是用来添加的时候标识 每一行的.
        template: '<table>\
                    <tr ng-repeat="datas in parentData" id="row_{{datas.id}}">\
                        <td><button ng-click="showSon(datas.id)">显示子类</button></td>\
                        <td>{{datas.id}}</td>\
                        <td>{{datas.name}}</td>\
                    </tr>\
                </table>',

        link: function (scope, element, attrs) {

            // 全局保存 信息, 这里 需要保存 所有的 id 是不是获取过
            // 如果获取过. 就是 true. 如果没有获取过, 就是 false
            scope.getStatus = [];

            // 保存 所有已经 获取的 信息. 以 parentId 存储
            // 注意 . 这里的数据很重要,
            // 在 关闭 一个 parentId 的时候. 我们需要关闭所有的他的子类.
            // 数据从这里调用
            scope.sonInfo = [];

            // 保存 现在显示的状态 . 如果 现在是显示. 则为 true
            //      如果现在的状态是隐藏. 就是 false
            // 主要是 ng-show 调用
            scope.showStatus = [];

            // 这是 第一批数据, 可以采用 动态加载的方式.
            // 就是 采用 push 的方法. 只有 采用 push 方法 才能使 ng-repeat 显示
            scope.parentData = [
                {
                    id: 1,
                    name: 1
                },
                {
                    id: 2,
                    name: 2
                },
                {
                    id: 3,
                    name: 3
                },
                {
                    id: 4,
                    name: 4
                }
            ];

            // 显示 子类信息
            // parentId 是 需要获取 信息的 父类 id
            scope.showSon = function (parentId) {

                // 如果  从来没有获取过信息.
                if (!scope.getStatus[parentId]) {

                    // 获取信息
                    getSon(parentId);

                    // 更改显示表示位
                    scope.showStatus[parentId] = true;
                } else {

                    // 说明 已经获取信息了. 如果是显示. 就将其隐藏.
                    // 如果 隐藏就将其显示

                    //  翻转 显示 状态
                    scope.showStatus[parentId] = !scope.showStatus[parentId];

                    // 如果 现在的状态 是 隐藏状态
                    if(!scope.showStatus[parentId]){

                        // 将所有的 他的 子 id 状态全部设置为 隐藏
                        hideAllSon(parentId);
                    }

                }
            };

            // 隐藏所有的 该 parentId 下面的 子类
            var hideAllSon = function(parentId){
                hideSubSon(parentId);
            }

            // 隐藏 子类
            var hideSubSon = function(parentId){

                if(scope.sonInfo[parentId]) {

                    // 遍历 每一个 sonInfo
                    // 对于每一个 数据都进行处理. 都更改他的状态位
                    $.each(scope.sonInfo[parentId], function (index, value) {

                        // 如果存在就更改
                        if (value.id && scope.showStatus[value.id]) {

                            // 更改状态位
                            scope.showStatus[value.id] = false;

                            // 递归调用
                            hideSubSon(value.id);
                        }
                    });
                }
            }

            // 获取 信息. 每一个 id 理论上来讲 只能执行一次
            var getSon = function (parentId) {

                // 这个地方 需要 通过 parentId 然后 构造 url 去 服务器获取信息
                $http.get('json/son.json_parentId_'+parentId).success(function (data) {

                    getSonSuccessful(data, parentId);
                });
            }

            // 当 获取信息成功以后
            var getSonSuccessful = function (data, parentId) {

                // 先保存信息
                scope.sonInfo[parentId] = data;

                // 更改 显示状态. 理论上来讲.这里只能获取一次
                scope.getStatus[parentId] = true;

                // 添加 DOM 重新构造 table
                // 注意. 这里面的 ng-show
                var template = '' +
                    '<tr ng-repeat="datas in sonInfo[' + parentId + ']" ng-show="showStatus[' + parentId + ']" id="row_{{datas.id}}">\
                    <td><button ng-click="showSon(datas.id)">显示子类</button></td>\
                    <td>{{datas.id}}</td>\
                    <td>{{datas.name}}</td>\
                </tr>';

                // 添加到现在的 DOM 中
                // 使用 angular 编译
                var contentTr = angular.element(template);
                contentTr.insertAfter($("#row_" + parentId));
                $compile(contentTr)(scope);

            }
        }
    }

}]);
