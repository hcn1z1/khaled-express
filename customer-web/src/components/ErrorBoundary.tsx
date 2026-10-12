'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="p-6 my-4 rounded-2xl bg-dark-850 border border-brand-900/50 text-gray-200 shadow-xl max-w-xl mx-auto text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-600/20 text-brand-500 mx-auto flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {this.props.fallbackTitle || 'Une erreur inattendue est survenue'}
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            {this.props.fallbackMessage ||
              'Le composant a rencontré un problème. Veuillez actualiser ou réessayer.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            onKeyDown={(e) => { if (e.key === 'Enter') this.handleReset(); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
