var filter = (window.location.search.match(/[?&]filter=([^&]+)/) || [])[1] || 'raw';

var YUI_config = {
    groups: {
        rednose: {
            combine:false,
            base: '../../../../build/',
            patterns: {
                'rednose-': {
                    configFn: function(me) {
                        if (/-css/.test(me.name)) {
                            me.type = 'css';
                            me.path = me.path.replace(/\.js/, '.css');
                            me.path = me.path.replace(/\-min/, '');
                        } else {
                            if (filter === 'coverage') {
                                me.path = me.path.replace(/\-min/, '-coverage');
                            } else {
                                me.path = me.path.replace(/\-min/, '');
                            }
                        }
                    }
                }
            }
        }
    }
};
