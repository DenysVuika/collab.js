'use strict';

describe('services', function () {
  describe('UiService', function () {

    //beforeEach(module('collabjs.services'));

    var scope;
    var httpBackend;
    var service;
    var successCallback;
    var errorCallback;
    var q;

    beforeEach(module('collabjs.services'));

    beforeEach(inject(function ($rootScope, $httpBackend, $q, uiService) {
      scope = $rootScope;
      httpBackend = $httpBackend;
      service = uiService;
      q = $q;
      successCallback = jasmine.createSpy('success');
      errorCallback = jasmine.createSpy('error');
    }));

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it('should have account service registered', function () {
      expect(service).not.toEqual(null);
    });

    it('should have primary api', function () {
      expect(angular.isFunction(service.updateLayout)).toBe(true);
      expect(angular.isFunction(service.showDialog)).toBe(true);
    });

    it('should broadcast layout update event', function () {
      spyOn(scope, '$broadcast').and.callThrough();

      service.updateLayout();

      var event = 'updateLayout@collab.js';
      expect(scope.$broadcast).toHaveBeenCalledWith(event);
    });

    it('showDialog should load base template', function () {
      var url = '/templates/form-modal.html';
      // respond with 500 as only request validation is the only goal of this test
      httpBackend.expectGET(url).respond(500);

      service.showDialog({});
      httpBackend.flush();
    });

    it('showDialog should compile and display UI', function () {
      var template = '<div id="modal1" class="modal"></div>';
      httpBackend.expectGET().respond(200, template);

      service.showDialog({});
      httpBackend.flush();

      var element = angular.element('#modal1');
      expect(element.hasClass('in')).toBe(true);

      element.remove();
    });

    it('should initialize dialog with default values', function () {
      var template = '<div id="modal1" class="modal"></div>';
      httpBackend.expectGET().respond(200, template);

      service.showDialog({});
      httpBackend.flush();

      var element = angular.element('#modal1');
      var scope = element.scope();

      expect(scope.title).toBe('Dialog');
      expect(scope.template).toBe('');
      expect(scope.okButtonText).toBe('OK');
      expect(scope.cancelButtonText).toBe('Cancel');

      element.remove();
    });

    it('should initialize dialog with custom values', function () {
      var template = '<div id="modal1" class="modal"></div>';
      httpBackend.expectGET().respond(200, template);

      var options = {
        title: 'Link to this post',
        template: '/templates/dlg-post-link.html',
        context: {},
        submit: {
          title: 'Done'
        },
        cancel: {
          enabled: false
        }
      };

      service.showDialog(options);
      httpBackend.flush();

      var element = angular.element('#modal1');
      var scope = element.scope();

      expect(scope.title).toBe(options.title);
      expect(scope.template).toBe(options.template);
      expect(scope.formObject).toBe(options.context);
      expect(scope.okButtonText).toBe(options.submit.title);
      expect(scope.cancelButton.enabled).toBe(false);

      element.remove();
    });

    it('showDialog should wire buttons', function () {
      var template = '<div id="modal1" class="modal"></div>';
      httpBackend.expectGET().respond(200, template);

      var okClicked = false;
      var cancelClicked = false;
      var options = {
        submit : {
          title: '[Submit]',
          action: function () {
            okClicked = true;
            return true;
          }
        },
        cancel: {
          title: '[Cancel]',
          action: function () {
            cancelClicked = true;
            return true;
          }
        }
      };

      service.showDialog(options);
      httpBackend.flush();

      var element = angular.element('#modal1');
      var scope = element.scope();

      expect(scope.okButton).not.toBeNull();
      expect(scope.okButton.title).toBe(options.submit.title);

      scope.okButton.action();
      expect(okClicked).toBe(true);

      expect(scope.cancelButton).not.toBeNull();
      expect(scope.cancelButton.title).toBe(options.cancel.title);

      scope.cancelButton.action();
      expect(cancelClicked).toBe(true);

      element.remove();
    });

    it('should hide dialog on default buttons click', function () {
      var template = '<div id="modal1" class="modal"></div>';
      httpBackend.expectGET().respond(200, template);

      service.showDialog({});
      httpBackend.flush();

      var element = angular.element('#modal1');
      expect(element.hasClass('in')).toBe(true);

      var scope = element.scope();

      scope.okButton.action();
      expect(element.hasClass('in')).toBe(false);

      scope.cancelButton.action();
      expect(element.hasClass('in')).toBe(false);

      element.remove();
    });

    it('should not hide dialog on custom buttons click', function () {
      var template = '<div id="modal1" class="modal"></div>';
      httpBackend.expectGET().respond(200, template);

      var options = {
        submit: {
          action: function () { return false; }
        },
        cancel: {
          action: function () { return false; }
        }
      };

      service.showDialog(options);
      httpBackend.flush();

      var element = angular.element('#modal1');
      expect(element.hasClass('in')).toBe(true);

      var scope = element.scope();

      scope.okButton.action();
      expect(element.hasClass('in')).toBe(true);

      scope.cancelButton.action();
      expect(element.hasClass('in')).toBe(true);

      element.remove();
    });

    it('should invoke promise on button click', function () {
      var template = '<div id="modal1" class="modal"></div>';
      httpBackend.expectGET().respond(200, template);

      var d = q.defer();

      var options = {
        submit: {
          action: function () {
            return d.promise;
          }
        }
      };

      service.showDialog(options);
      httpBackend.flush();

      var element = angular.element('#modal1');
      expect(element.hasClass('in')).toBe(true);

      var scope = element.scope();

      scope.okButton.action();
      d.resolve();
      scope.$root.$digest();
      expect(element.hasClass('in')).toBe(false);

      element.remove();
    });
  });
});