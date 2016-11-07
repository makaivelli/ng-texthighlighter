// Generated by CoffeeScript 1.11.1
(function() {
  var HighlightFactory, HighlighterDirective, HighlighterService, app,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  HighlightFactory = (function() {
    function HighlightFactory() {
      return {
        createWrapper: function() {
          var span;
          span = document.createElement('span');
          span.style.background = 'rgba(255, 0, 0, 0.2)';
          return span;
        }
      };
    }

    return HighlightFactory;

  })();

  HighlighterService = (function() {
    var IGNORE_TAGS;

    IGNORE_TAGS = ['SCRIPT', 'STYLE', 'SELECT', 'OPTION', 'OBJECT', 'APPLET', 'VIDEO', 'AUDIO', 'CANVAS', 'EMBED', 'PARAM', 'METER', 'PROGRESS'];

    function HighlighterService(HighlightFactory) {
      this.HighlightFactory = HighlightFactory;
      this.highlight = bind(this.highlight, this);
      this.highlightRange = bind(this.highlightRange, this);
      this.refineRangeBoundaries = bind(this.refineRangeBoundaries, this);
    }

    HighlighterService.prototype.refineRangeBoundaries = function(range) {
      var ancestor, endContainer, goDeeper, startContainer;
      startContainer = range.startContainer;
      endContainer = range.endContainer;
      ancestor = range.commonAncestorContainer;
      goDeeper = true;
      switch (false) {
        case range.endOffset !== 0:
          while (!endContainer.previousSibling && endContainer.parentNode !== ancestor) {
            endContainer = endContainer.parentNode;
          }
          endContainer = endContainer.previousSibling;
          break;
        case endContainer.nodeType !== 3:
          if (range.endOffset < endContainer.nodeValue.length) {
            endContainer.splitText(range.endOffset);
          }
          break;
        case !(range.endOffset > 0):
          endContainer = endContainer.childNodes.item(range.endOffset - 1);
      }
      switch (false) {
        case startContainer.nodeType !== 3:
          if (range.startOffset === startContainer.nodeValue.length) {
            goDeeper = false;
          } else if (range.startOffset > 0) {
            startContainer = startContainer.splitText(range.startOffset);
            if (endContainer === startContainer.previousSibling) {
              endContainer = startContainer;
            }
          }
          break;
        case !(range.startOffset < startContainer.childNodes.length):
          startContainer = startContainer.childNodes.item(range.startOffset);
          break;
        default:
          startContainer = startContainer.nextSibling;
      }
      return {
        startContainer: startContainer,
        endContainer: endContainer,
        goDeeper: goDeeper
      };
    };

    HighlighterService.prototype.highlightRange = function(el, range, wrapper) {
      var done, endContainer, goDeeper, highlight, highlights, node, nodeParent, ref, ref1, result, startContainer, wrapperClone;
      result = this.refineRangeBoundaries(range);
      startContainer = result.startContainer;
      endContainer = result.endContainer;
      goDeeper = result.goDeeper;
      done = false;
      node = startContainer;
      highlights = [];
      while (true) {
        if (goDeeper && node.nodeType === 3) {
          if ((ref = node.parentNode.tagName, indexOf.call(IGNORE_TAGS, ref) < 0) && node.nodeValue.trim() !== '') {
            wrapperClone = wrapper.cloneNode(true);
            nodeParent = node.parentNode;
            if ((el !== nodeParent && el.contains(nodeParent)) || nodeParent === el) {
              if (node.parentNode) {
                node.parentNode.insertBefore(wrapperClone, node);
              }
              wrapperClone.appendChild(node);
              highlight = wrapperClone;
              highlights.push(highlight);
            }
          }
          goDeeper = false;
        }
        if (node === endContainer && !(endContainer.hasChildNodes() && goDeeper)) {
          done = true;
        }
        if (node.tagName && (ref1 = node.tagName, indexOf.call(IGNORE_TAGS, ref1) >= 0)) {
          if (endContainer.parentNode === node) {
            done = true;
          }
          goDeeper = false;
        }
        node = (function() {
          switch (false) {
            case !(goDeeper && node.hasChildNodes):
              return node.firstChild;
            case !node.nextSibling:
              goDeeper = true;
              return node.nextSibling;
            default:
              goDeeper = false;
              return node.parentNode;
          }
        })();
        if (done) {
          break;
        }
      }
      return highlights;
    };

    HighlighterService.prototype.highlight = function(el, range) {
      var wrapper;
      wrapper = this.HighlightFactory.createWrapper();
      return console.log(this.highlightRange(el, range, wrapper));
    };

    return HighlighterService;

  })();

  HighlighterDirective = (function() {
    function HighlighterDirective(HighlighterService, $element) {
      this.HighlighterService = HighlighterService;
      this.$element = $element;
      this.handleHighlight = bind(this.handleHighlight, this);
      this.getSelection = bind(this.getSelection, this);
      this.el = this.$element[0];
      this.el.addEventListener('mouseup', this.handleHighlight);
    }

    HighlighterDirective.prototype.getSelection = function() {
      return (this.el.ownerDocument || this.el).defaultView.getSelection();
    };

    HighlighterDirective.prototype.handleHighlight = function() {
      var range, selection;
      selection = this.getSelection();
      if (!(selection.rangeCount > 0)) {
        return;
      }
      range = selection.getRangeAt(0);
      if (range.collapsed) {
        return;
      }
      return this.HighlighterService.highlight(this.el, range);
    };

    return HighlighterDirective;

  })();

  app = angular.module('ng-highlighter', []);

  app.factory('HighlightFactory', HighlightFactory);

  app.service('HighlighterService', HighlighterService);

  app.directive('highlighter', function() {
    return {
      restrict: 'A',
      controller: HighlighterDirective
    };
  });

}).call(this);
