angular.module('App').controller(
  'HostingTabTasksCtrl',
  class HostingTabTasksCtrl {
    constructor($q, $scope, $stateParams, $translate, Alerter, Hosting) {
      this.$scope = $scope;
      this.$stateParams = $stateParams;
      this.$translate = $translate;
      this.Alerter = Alerter;
      this.Hosting = Hosting;
      this.$q = $q;
    }

    $onInit() {
      this.states = {
        DOING: 'DOING',
        ERROR: 'ERROR',
        DONE: 'DONE',
        CANCELLED: 'CANCELLED',
        TODO: 'TODO',
        INIT: 'INIT',
      };
      this.tasksList = undefined;

      this.loadPaginated = this.loadPaginated.bind(this);

      this.$scope.$on(this.Hosting.events.tasksChanged, () => {
        this.$scope.$broadcast('paginationServerSide.reload', 'tasksTable');
      });
    }

    loadPaginated({ pageSize, offset }) {
      return this.$q.all({
        hosting: this.Hosting.getHosting(this.$stateParams.productId),
        tasks: this.Hosting.getTasksList(
          this.$stateParams.productId,
          pageSize,
          offset - 1,
        ),
      })
        .then((resp) => {
          this.hosting = resp.hosting;
          this.tasksList = resp.tasks;
          return {
            data: resp.tasks.list.results,
            meta: {
              totalCount: resp.tasks.count,
            },
          };
        })
        .catch((err) => {
          this.Alerter.alertFromSWS(
            this.$translate.instant('hosting_tab_TASKS_error_message'),
            _.get(err, 'data', err),
            this.$scope.alerts.main,
          );
        });
    }

    refreshTable() {
      this.$scope.$broadcast('paginationServerSide.reload', 'tasksTable');
    }
  },
);
