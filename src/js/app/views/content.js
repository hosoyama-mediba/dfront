import backbone from 'backbone';

export default backbone.View.extend({
    el: '.js-content',
    initialize() {
        console.dir(this);
    },
    render() {
        this.$el.append('<p>コンテンツ</p>');
    }
})
