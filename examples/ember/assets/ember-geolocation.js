(function() {
var get = Ember.get, set = Ember.set;

Ember.GeoLocation = Ember.Object.extend({
  /**
   * @property {Boolean}
   * When set to true, continually monitor the location of the device (beginning immediately).
   * When using google gears, if the user denies access or another error occurs, this will be reset to false.
   */
  autoUpdate: true,

  /**
   * @property {Number}
   * Read-only property representing the last retrieved
   * geographical coordinate specified in degrees.
   */
  latitude: null,

  /**
   * @property {Number}
   * Read-only property representing the last retrieved
   * geographical coordinate specified in degrees.
   */
  longitude: null,

  /**
   * @property {Number}
   * Read-only property representing the last retrieved
   * accuracy level of the latitude and longitude coordinates,
   * specified in meters.
   * This will always be a non-negative number.
   * This corresponds to a 95% confidence level.
   */
  accuracy: null,

  /**
   * @property {Number}
   * Read-only property representing the last retrieved
   * height of the position, specified in meters above the ellipsoid
   * (http://dev.w3.org/geo/api/spec-source.html#ref-wgs)[WGS84].
   */
  altitude: null,

  /**
   * @property {Number}
   * Read-only property representing the last retrieved
   * accuracy level of the altitude coordinate, specified in meters.<br/>
   * If altitude is not null then this will be a non-negative number.
   * Otherwise this returns null.<br/>
   * This corresponds to a 95% confidence level.
   */
  altitudeAccuracy: null,

  /**
   * @property {Number}
   * Read-only property representing the last retrieved
   * direction of travel of the hosting device,
   * specified in non-negative degrees between 0 and 359,
   * counting clockwise relative to the true north.<br/>
   * If speed is 0 (device is stationary), then this returns NaN
   */
  heading: null,

  /**
   * @property {Number}
   * Read-only property representing the last retrieved
   * current ground speed of the device, specified in meters per second.<br/>
   * If this feature is unsupported by the device, this returns null.<br/>
   * If the device is stationary, this returns 0,
   * otherwise it returns a non-negative number.
   */
  speed: null,
  /**
   * @property {Date}
   * Read-only property representing when the last retrieved
   * positioning information was acquired by the device.
   */
  timestamp: null,

  /**
   * @property {Boolean}
   * When set to true, provide a hint that the application would like to receive
   * the best possible results. This may result in slower response times or increased power consumption.
   * The user might also deny this capability, or the device might not be able to provide more accurate
   * results than if this option was set to false.
   */
  allowHighAccuracy: false,

  /**
   * @property {Number}
   * The maximum number of milliseconds allowed to elapse between a location update operation.
   * If a location was not successfully acquired before the given timeout elapses 
   * (and no other internal errors have occurred in this interval),
   * then a errorObject will be set indicating a timeout as the cause.
   * Note that the time that is spent obtaining the user permission is *not* included in the period
   * covered by the timeout.  The timeout attribute only applies to the location acquisition operation.
   * In the case of calling updateLocation, the {@link #locationerror} event will be raised only once.
   * If {@link #autoUpdate} is set to true, the {@link #locationerror} event could be raised repeatedly.
   * The first timeout is relative to the moment {@link #autoUpdate} was set to true
   * (or this {@link Ext.util.GeoLocation} was initialized with the {@link #autoUpdate} config option set to true).
   * Subsequent timeouts are relative to the moment when the device determines that it's position has changed.
   */
  timeout: Infinity,

  /**
   * @property {Number}
   * This option indicates that the application is willing to accept cached location information whose age
   * is no greater than the specified time in milliseconds. If maximumAge is set to 0, an attempt to retrieve
   * new location information is made immediately.
   * Setting the maximumAge to Infinity returns a cached position regardless of its age.
   * If the device does not have cached location information available whose age is no
   * greater than the specified maximumAge, then it must acquire new location information.
   * For example, if location information no older than 10 minutes is required, set this property to 600000.
   */
  maximumAge: 0,

  /**
   * @property {Boolean}
   */
  isSupported: ('geolocation' in window.navigator),

  hasLocationBinding: Ember.Binding.bool('timestamp'),

  init: function() {
    this._super();
    this._provider = this._provider ||
      (navigator.geolocation ? navigator.geolocation :
        (window.google || {}).gears ? google.gears.factory.create('beta.geolocation') : null);
    
    if (get(this, 'autoUpdate')) {
      Ember.run.next(this, 'autoUpdateDidChange');
    }
  },

  /**
   * Executes a onetime location update operation,
   * Does not interfere with or restart ongoing location monitoring.
   * @param {Object}
   */
  updateLocation: function(positionOptions) {
    if (positionOptions && positionOptions.isView) {
      positionOptions = null;
    }
    if (!get(this, 'isSupported')) {
      this.locationUpdateError(null, 'Not Supported');
      return;
    }

    try {
      this._provider.getCurrentPosition(
        $.proxy(this, 'locationUpdateSuccess'),
        $.proxy(this, 'locationUpdateError'),
        positionOptions ? positionOptions : get(this, 'positionOptions'));
    } catch(e) {
      this.locationUpdateError(e);
    }
  },

  /**
   * Enabled/disables the auto-retrieval of the location information.
   * If called with autoUpdate=true, it will execute an immediate location update
   * and continue monitoring for location updates.
   * If autoUpdate=false, any current location change monitoring will be disabled.
   * A {@link #locationerror} event is fired if the location cannot be determined due
   * di an error supporting geolocation.
   * @param {Boolean} autoUpdate Whether to start/stop location monitoring.
   * @return {Boolean} If enabling autoUpdate, returns false if the location tracking
   * cannot begin due to an error supporting geolocation.
   */
  autoUpdateDidChange: function() {
    var autoUpdate = get(this, 'autoUpdate');
    if (this._watchOperation !== null) {
      this._provider.clearWatch(this._watchOperation);
      this._watchOperation = null;
    }
    if (!autoUpdate) {
      return;
    }

    if (!get(this, 'isSupported')) {
      this.locationUpdateError(null, 'Not Supported');
      return;
    }

    try {
      this._watchOperation = this._provider.watchPosition(
        $.proxy(this, 'locationUpdateSuccess'),
        $.proxy(this, 'locationUpdateError'),
        get(this, 'positionOptions'));
    } catch(e) {
      set(this, 'autoUpdate', false);
      this.locationUpdateError(e);
    }
  }.observes('autoUpdate', 'positionOptions'),

  locationUpdateSuccess: function(position) {
    this.setProperties({
      timestamp: position.timestamp,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      // set status
      isError: false,
      errorObject: null,
      //google doesn't provide these two
      heading: (typeof position.coords.heading == 'undefined') ? null : position.coords.heading,
      speed: (typeof position.coords.speed == 'undefined') ? null : position.coords.speed
    });

    this.locationDidChange();
  },

  locationUpdateError: function(error, message) {
    this.setProperties({
      isError: true,
      errorObject: {
        TIMEOUT: error && error.code && error.code === error.TIMEOUT,
        PERMISSION_DENIED: error && error.code && error.code === error.PERMISSION_DENIED,
        POSITION_UNAVAILABLE: error && error.code && error.code === error.POSITION_UNAVAILABLE,
        message: (error && error.message) ? error.message : message
      }
    });
  },

  positionOptions: function() {
    return {
      maximumAge: get(this, 'maximumAge'),
      allowHighAccuracy: get(this, 'allowHighAccuracy'),
      timeout: get(this, 'timeout')
    };
  }.property('maximumAge', 'allowHighAccuracy', 'timeout').cacheable(),

  locationDidChange: Ember.K
});

})();
