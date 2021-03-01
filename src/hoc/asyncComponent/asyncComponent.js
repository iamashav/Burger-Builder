import React, {Component} from 'react';

const asyncComponent = (importComponent) => {

    return class extends Component {
        state = {
            componenet: null
        }

        componentDidMount () {
            importComponent()
                .then(cmp => {
                    this.setState({componenet: cmp.default});
                });
        }

        render () {
            const C = this.state.componenet;

            return C ? <C {...this.props} /> : null;
        }

    }
}

export default asyncComponent;