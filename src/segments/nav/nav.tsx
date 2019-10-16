import React from 'react';
import './nav.scss';
import fruition from '../../assets/images/fruition.png';

interface NavProps {
  onSegmentChange: any,
  initialNavState: any,
  navItems: any
}

interface NavState {
  currentNav: any
}

export default class Nav extends React.Component<NavProps, NavState> {
  constructor(props) {
    super(props);

    this.state = { currentNav: props.initialNavState };
  }

  triggerSegmentChange = (event: any) => {
    const segment = event.target.id;
    this.props.onSegmentChange(segment);
    this.setState({ currentNav: segment });
  }

  render() {
    const { navItems } = this.props;
    const { currentNav } = this.state;
    const navs = navItems.slice().map((n) => (
      <div key={n.name} className={n.name===currentNav ? "Nav-Item Active" : "Nav-Item"} id={n.name} onClick={this.triggerSegmentChange}>
        <div className="nav-icon">{n.icon}</div>
        {/* <div className="nav-text">{n.name}</div> */}
      </div>
    ));

    return (
      <div className="Nav">
        { navs }
        <div className="Nav-Item">
          <img src={fruition} alt="logo" className="logo" />
        </div>
      </div>
    );
  }
}