import { Component } from 'react';

// Shows a readable message instead of a blank white page if any page crashes
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('NexMart page error:', error, info?.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="w" style={{ padding: '40px 0' }}>
        <div className="box">
          <h2>Something went wrong on this page</h2>
          <p className="mu" style={{ margin: '8px 0 14px' }}>{String(this.state.error?.message || this.state.error)}</p>
          <button className="btn" onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}>Go to home</button>
        </div>
      </div>
    );
  }
}
