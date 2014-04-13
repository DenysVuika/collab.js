'use strict';

describe('controllers', function () {
  describe('HelpController', function () {

    var ctrl, scope;
    var deferred;
    var helpService;
    var routeParams;
    var sce;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q) {

      helpService = {
        getArticle: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };

      routeParams = {};
      sce = {
        trustAsHtml: function (data) {
          return data;
        }
      };

      scope = $rootScope.$new();
      ctrl = $controller('HelpController', {
        $scope: scope,
        helpService: helpService,
        $routeParams: routeParams,
        $sce: sce
      });
    }));

    it('should call getArticle on help service when init is called', function () {
      spyOn(helpService, 'getArticle').and.callThrough();

      scope.init();

      expect(helpService.getArticle).toHaveBeenCalled();
    });

    it('should use request params to get the article name', function () {
      spyOn(helpService, 'getArticle').and.callThrough();

      var article = '[article]';
      routeParams.article = article;
      scope.init();

      expect(helpService.getArticle).toHaveBeenCalledWith(article);
    });

    it('should use article content as trusted html', function () {
      spyOn(sce, 'trustAsHtml').and.callThrough();

      scope.init();
      deferred.resolve();
      scope.$root.$digest();

      expect(sce.trustAsHtml).toHaveBeenCalled();
    });

  });
});