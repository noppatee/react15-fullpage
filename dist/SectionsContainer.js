'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SectionsContainer = _react2.default.createClass({
  displayName: 'SectionsContainer',


  propTypes: {
    delay: _react2.default.PropTypes.number,
    verticalAlign: _react2.default.PropTypes.bool,
    scrollBar: _react2.default.PropTypes.bool,
    navigation: _react2.default.PropTypes.bool,
    className: _react2.default.PropTypes.string,
    sectionClassName: _react2.default.PropTypes.string,
    navigationClass: _react2.default.PropTypes.string,
    navigationAnchorClass: _react2.default.PropTypes.string,
    activeClass: _react2.default.PropTypes.string,
    sectionPaddingTop: _react2.default.PropTypes.string,
    sectionPaddingBottom: _react2.default.PropTypes.string,
    arrowNavigation: _react2.default.PropTypes.bool,
    ignoreTouchClass: _react2.default.PropTypes.string
  },

  childContextTypes: {
    verticalAlign: _react2.default.PropTypes.bool,
    sectionClassName: _react2.default.PropTypes.string,
    sectionPaddingTop: _react2.default.PropTypes.string,
    sectionPaddingBottom: _react2.default.PropTypes.string
  },

  getInitialState: function getInitialState() {
    return {
      activeSection: 0,
      scrollingStarted: false,
      sectionScrolledPosition: 0,
      windowHeight: window.innerHeight
    };
  },
  getDefaultProps: function getDefaultProps() {
    return {
      delay: 1000,
      verticalAlign: false,
      scrollBar: false,
      navigation: true,
      className: 'SectionContainer',
      sectionClassName: 'Section',
      anchors: [],
      activeClass: 'active',
      sectionPaddingTop: '0',
      sectionPaddingBottom: '0',
      arrowNavigation: true,
      ignoreTouchClass: ''
    };
  },
  getChildContext: function getChildContext() {
    return {
      verticalAlign: this.props.verticalAlign,
      sectionClassName: this.props.sectionClassName,
      sectionPaddingTop: this.props.sectionPaddingTop,
      sectionPaddingBottom: this.props.sectionPaddingBottom
    };
  },
  componentWillUnmount: function componentWillUnmount() {
    window.removeEventListener('resize', this._handleResize);
    window.removeEventListener('hashchange', this._handleAnchor);
    this._removeMouseWheelEventHandlers();

    window.removeEventListener('keydown', this._handleArrowKeys);

    document.querySelector('body').style.overflow = 'visible';

    this._removeTouchEventHandlers();
  },
  componentDidMount: function componentDidMount() {
    window.addEventListener('resize', this._handleResize);

    if (!this.props.scrollBar) {
      this._addCSS3Scroll();
      this._handleAnchor(); //Go to anchor in case we found it in the URL

      window.addEventListener('hashchange', this._handleAnchor, false); //Add an event to watch the url hash changes

      if (this.props.arrowNavigation) {
        window.addEventListener('keydown', this._handleArrowKeys);
      }
    }

    // try touch events
    this._addTouchEventHandlers();
  },
  _addCSS3Scroll: function _addCSS3Scroll() {
    this._addOverflowToBody();
    this._addHeightToParents();
    this._addMouseWheelEventHandlers();
  },
  _addActiveClass: function _addActiveClass() {
    this._removeActiveClass();

    var hash = window.location.hash.substring(1);
    var activeLinks = document.querySelectorAll('a[href="#' + hash + '"]');

    for (var i = 0; i < activeLinks.length; i++) {
      activeLinks[i].className = activeLinks[i].className + (activeLinks[i].className.length > 0 ? ' ' : '') + ('' + this.props.activeClass);
    }

    //console.log(allLinks);
  },
  _removeActiveClass: function _removeActiveClass() {
    var activeLinks = document.querySelectorAll('a:not([href="#' + this.props.anchors[this.state.activeSection] + '"])');

    for (var i = 0; i < activeLinks.length; i++) {
      activeLinks[i].className = activeLinks[i].className.replace(/\b ?active/g, '');
    }
  },
  _addChildrenWithAnchorId: function _addChildrenWithAnchorId() {
    var index = 0;
    return _react2.default.Children.map(this.props.children, function (child) {
      var id = this.props.anchors[index];
      index++;
      if (id) {
        return _react2.default.cloneElement(child, {
          id: id
        });
      } else {
        return child;
      }
    }.bind(this));
  },
  _addOverflowToBody: function _addOverflowToBody() {
    document.querySelector('body').style.overflow = 'hidden';
  },


  // height 100% - to have container fixed height
  _addHeightToParents: function _addHeightToParents() {
    // let child = this.refs;
    var child = _reactDom2.default.findDOMNode(this);
    var previousParent = child.parentNode;

    while (previousParent) {
      if ('style' in previousParent) {
        previousParent.style.height = '100%';
        previousParent = previousParent.parentNode;
      } else {
        return false;
      }
    }
  },
  _removeHeightFromParents: function _removeHeightFromParents() {
    var child = _reactDom2.default.findDOMNode(this);
    var previousParent = child.parentNode;

    while (previousParent) {
      if ('style' in previousParent && previousParent.style.height && previousParent.style.height == '100%') {
        previousParent.style.height = undefined;
        previousParent = previousParent.parentNode;
      } else {
        return false;
      }
    }
  },
  _addMouseWheelEventHandlers: function _addMouseWheelEventHandlers() {
    window.addEventListener('mousewheel', this._mouseWheelHandler, false);
    window.addEventListener('DOMMouseScroll', this._mouseWheelHandler, false);
  },
  _removeMouseWheelEventHandlers: function _removeMouseWheelEventHandlers() {
    window.removeEventListener('mousewheel', this._mouseWheelHandler);
    window.removeEventListener('DOMMouseScroll', this._mouseWheelHandler);
  },
  _mouseWheelHandler: function _mouseWheelHandler() {
    var _this = this;

    this._removeMouseWheelEventHandlers();

    var e = window.event || e; // old IE support
    var delta = Math.max(-1, Math.min(1, e.wheelDeltaY || -e.detail));
    var position = this.state.sectionScrolledPosition + delta * this.state.windowHeight;
    var activeSection = this.state.activeSection - delta;
    var maxPosition = 0 - this.props.children.length * this.state.windowHeight;

    if (position > 0 || maxPosition === position || this.state.scrollingStarted) {
      return this._addMouseWheelEventHandlers();
    }

    var index = this.props.anchors[activeSection];
    if (!this.props.anchors.length || index) {
      window.location.hash = '#' + index;
    }

    this.setState({
      activeSection: activeSection,
      scrollingStarted: true,
      sectionScrolledPosition: position
    });

    setTimeout(function () {
      _this.setState({
        scrollingStarted: false
      });
      _this._addMouseWheelEventHandlers();
    }, this.props.delay + 300);
  },
  _handleResize: function _handleResize() {
    var position = 0 - this.state.activeSection * window.innerHeight;
    this.setState({
      windowHeight: window.innerHeight,
      sectionScrolledPosition: position
    });
  },
  _handleSectionTransition: function _handleSectionTransition(index) {
    var position = 0 - index * this.state.windowHeight;

    if (!this.props.anchors.length || index === -1 || index >= this.props.anchors.length) {
      return false;
    }

    this.setState({
      activeSection: index,
      sectionScrolledPosition: position
    });
  },
  _handleArrowKeys: function _handleArrowKeys(e) {
    var event = window.event ? window.event : e;
    var direction = event.keyCode === 38 || event.keyCode === 37 ? this.state.activeSection - 1 : event.keyCode === 40 || event.keyCode === 39 ? this.state.activeSection + 1 : -1;
    var hash = this.props.anchors[direction];

    if (!this.props.anchors.length || hash) {
      window.location.hash = '#' + hash;
    }

    this._handleSectionTransition(direction);
  },
  _handleAnchor: function _handleAnchor() {
    var hash = window.location.hash.substring(1);
    var index = this.props.anchors.indexOf(hash);

    this._handleSectionTransition(index);

    this._addActiveClass();
  },
  _addTouchEventHandlers: function _addTouchEventHandlers() {
    window.addEventListener('touchstart', this._touchStartHandler);
    // window.addEventListener('touchmove', this._touchMoveHandler);
    // window.addEventListener('touchend', this._touchEndHandler);
  },
  _removeTouchEventHandlers: function _removeTouchEventHandlers() {
    window.removeEventListener('touchstart', this._touchStartHandler);
    window.removeEventListener('touchmove', this._touchMoveHandler);
    window.removeEventListener('touchend', this._touchEndHandler);
  },
  _touchStartHandler: function _touchStartHandler(evt) {
    if (this.props.ignoreTouchClass.length && evt.target) {
      var child = evt.target;
      var previousParent = child.parentNode;

      while (previousParent) {
        if (previousParent.className && previousParent.className.indexOf(this.props.ignoreTouchClass) >= 0) {
          console.log('found', this.props.ignoreTouchClass);
          return true;
        } else {
          previousParent = previousParent.parentNode;
          // return false;
        }
      }
    }

    var touches = evt.changedTouches;
    this.startX = touches[0].pageX;
    this.startY = touches[0].pageY;
    this.startTime = new Date().getTime();
    evt.preventDefault();
    window.addEventListener('touchmove', this._touchMoveHandler);
    window.addEventListener('touchend', this._touchEndHandler);
  },
  _touchMoveHandler: function _touchMoveHandler(evt) {
    evt.preventDefault();
  },
  _touchEndHandler: function _touchEndHandler(evt) {
    var _this2 = this;

    this._removeTouchEventHandlers();

    var distThreshold = 100;
    var allowedTime = 300;

    var elapseTime = this.startTime ? new Date().getTime() - this.startTime : -1;

    var touches = evt.changedTouches;

    // let deltaX = this.startX - touches[0].pageX;
    var deltaY = this.startY - touches[0].pageY;

    var offsetDelta = Math.max(-1, Math.min(1, deltaY));
    var position = this.state.sectionScrolledPosition - offsetDelta * this.state.windowHeight;
    var activeSection = this.state.activeSection + offsetDelta;
    var maxPosition = 0 - this.props.children.length * this.state.windowHeight;

    if (elapseTime > 0 && elapseTime <= allowedTime) {

      if (position > 0 || maxPosition === position || this.state.scrollingStarted) {
        evt.preventDefault();
        return this._addTouchEventHandlers();
      }

      if (Math.abs(deltaY) >= distThreshold) {

        var index = this.props.anchors[activeSection];
        if (!this.props.anchors.length || index) {
          window.location.hash = '#' + index;
        }

        this.setState({
          activeSection: activeSection,
          scrollingStarted: true,
          sectionScrolledPosition: position
        });

        setTimeout(function () {
          _this2.setState({
            scrollingStarted: false
          });
          // this._addTouchEventHandlers();
        }, this.props.delay + 300);
      } else {
        // this._addTouchEventHandlers();
      }
    } else {
        // this._addTouchEventHandlers();
      }
    this._addTouchEventHandlers();
    evt.preventDefault();
  },
  renderNavigation: function renderNavigation() {
    var _this3 = this;

    var navigationStyle = {
      position: 'fixed',
      zIndex: '10',
      right: '20px',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    };

    var anchors = this.props.anchors.map(function (link, index) {
      var anchorStyle = {
        display: 'block',
        margin: '10px',
        borderRadius: '100%',
        backgroundColor: '#556270',
        padding: '5px',
        transition: 'all 0.2s',
        transform: _this3.state.activeSection === index ? 'scale(1.3)' : 'none'
      };
      return _react2.default.createElement('a', { href: '#' + link, key: index, className: _this3.props.navigationAnchorClass || 'Navigation-Anchor', style: _this3.props.navigationAnchorClass ? null : anchorStyle });
    });

    return _react2.default.createElement(
      'div',
      { className: this.props.navigationClass || 'Navigation', style: this.props.navigationClass ? null : navigationStyle },
      anchors
    );
  },
  render: function render() {
    var outerContainerStyle = {
      height: '100%'
    };

    var containerStyle = {
      height: '100%',
      width: '100%',
      position: 'relative',
      transform: 'translate3d(0px, ' + this.state.sectionScrolledPosition + 'px, 0px)',
      transition: 'all ' + this.props.delay + 'ms ease'
    };
    return _react2.default.createElement(
      'div',
      { style: outerContainerStyle },
      _react2.default.createElement(
        'div',
        { className: this.props.className, style: containerStyle },
        this.props.scrollBar ? this._addChildrenWithAnchorId() : this.props.children
      ),
      this.props.navigation && !this.props.scrollBar ? this.renderNavigation() : null
    );
  }
});

exports.default = SectionsContainer;