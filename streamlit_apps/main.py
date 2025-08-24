import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import requests
import json

# Page configuration
st.set_page_config(
    page_title="DataWeb ML Hub",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border-left: 4px solid #667eea;
    }
    .project-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border: 1px solid #e0e0e0;
        transition: transform 0.2s;
    }
    .project-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
</style>
""", unsafe_allow_html=True)

# Sidebar
st.sidebar.title("🤖 DataWeb ML Hub")
st.sidebar.markdown("---")

# Navigation
page = st.sidebar.selectbox(
    "Choose a Project",
    ["🏠 Dashboard", "📊 Data Analytics", "🤖 Machine Learning", "📈 Predictive Models", "🔍 Data Visualization"]
)

# Main content
if page == "🏠 Dashboard":
    st.markdown('<div class="main-header"><h1>DataWeb Machine Learning Hub</h1><p>Advanced Analytics & AI Solutions</p></div>', unsafe_allow_html=True)
    
    # Key Metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <h3>📊 Active Models</h3>
            <h2>12</h2>
            <p>Production Ready</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <h3>🎯 Accuracy</h3>
            <h2>94.2%</h2>
            <p>Average Performance</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <h3>⚡ Predictions</h3>
            <h2>1.2M</h2>
            <p>This Month</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown("""
        <div class="metric-card">
            <h3>💰 Revenue Impact</h3>
            <h2>$2.4M</h2>
            <p>Generated</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Recent Activity Chart
    st.subheader("📈 Model Performance Trends")
    
    # Generate sample data
    dates = pd.date_range(start='2024-01-01', end='2024-01-31', freq='D')
    performance_data = pd.DataFrame({
        'Date': dates,
        'Accuracy': np.random.normal(94, 2, len(dates)),
        'Precision': np.random.normal(92, 3, len(dates)),
        'Recall': np.random.normal(89, 4, len(dates))
    })
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=performance_data['Date'], y=performance_data['Accuracy'], 
                            mode='lines+markers', name='Accuracy', line=dict(color='#667eea')))
    fig.add_trace(go.Scatter(x=performance_data['Date'], y=performance_data['Precision'], 
                            mode='lines+markers', name='Precision', line=dict(color='#764ba2')))
    fig.add_trace(go.Scatter(x=performance_data['Date'], y=performance_data['Recall'], 
                            mode='lines+markers', name='Recall', line=dict(color='#f093fb')))
    
    fig.update_layout(
        title="Model Performance Over Time",
        xaxis_title="Date",
        yaxis_title="Score (%)",
        hovermode='x unified',
        height=400
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Project Cards
    st.subheader("🚀 Featured Projects")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        <div class="project-card">
            <h3>📊 Customer Churn Prediction</h3>
            <p>Predict customer churn using machine learning with 94% accuracy.</p>
            <ul>
                <li>Random Forest Model</li>
                <li>Real-time Predictions</li>
                <li>API Integration</li>
            </ul>
            <button style="background: #667eea; color: white; padding: 0.5rem 1rem; border: none; border-radius: 5px; cursor: pointer;">
                View Project
            </button>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="project-card">
            <h3>🎯 Sales Forecasting</h3>
            <p>Time series analysis for sales prediction with 91% accuracy.</p>
            <ul>
                <li>LSTM Neural Networks</li>
                <li>Seasonal Decomposition</li>
                <li>Interactive Dashboard</li>
            </ul>
            <button style="background: #667eea; color: white; padding: 0.5rem 1rem; border: none; border-radius: 5px; cursor: pointer;">
                View Project
            </button>
        </div>
        """, unsafe_allow_html=True)

elif page == "📊 Data Analytics":
    st.title("📊 Data Analytics Dashboard")
    
    # File upload
    uploaded_file = st.file_uploader("Upload your dataset", type=['csv', 'xlsx'])
    
    if uploaded_file is not None:
        try:
            df = pd.read_csv(uploaded_file)
            st.success(f"✅ Successfully loaded {len(df)} rows and {len(df.columns)} columns")
            
            # Basic statistics
            st.subheader("📈 Dataset Overview")
            col1, col2 = st.columns(2)
            
            with col1:
                st.write("**Dataset Info:**")
                st.write(f"- Shape: {df.shape}")
                st.write(f"- Memory Usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
                st.write(f"- Missing Values: {df.isnull().sum().sum()}")
            
            with col2:
                st.write("**Data Types:**")
                st.write(df.dtypes.value_counts())
            
            # Data preview
            st.subheader("👀 Data Preview")
            st.dataframe(df.head())
            
            # Column analysis
            st.subheader("🔍 Column Analysis")
            selected_column = st.selectbox("Select a column to analyze:", df.columns)
            
            if selected_column:
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write(f"**Statistics for {selected_column}:**")
                    st.write(df[selected_column].describe())
                
                with col2:
                    # Plot based on data type
                    if df[selected_column].dtype in ['int64', 'float64']:
                        fig = px.histogram(df, x=selected_column, title=f"Distribution of {selected_column}")
                        st.plotly_chart(fig, use_container_width=True)
                    else:
                        value_counts = df[selected_column].value_counts()
                        fig = px.bar(x=value_counts.index, y=value_counts.values, 
                                   title=f"Value Counts for {selected_column}")
                        st.plotly_chart(fig, use_container_width=True)
            
            # Correlation matrix for numerical columns
            numerical_cols = df.select_dtypes(include=[np.number]).columns
            if len(numerical_cols) > 1:
                st.subheader("🔗 Correlation Matrix")
                corr_matrix = df[numerical_cols].corr()
                fig = px.imshow(corr_matrix, 
                              title="Correlation Matrix",
                              color_continuous_scale='RdBu',
                              aspect='auto')
                st.plotly_chart(fig, use_container_width=True)
                
        except Exception as e:
            st.error(f"Error loading file: {str(e)}")
    else:
        st.info("👆 Please upload a CSV or Excel file to get started")

elif page == "🤖 Machine Learning":
    st.title("🤖 Machine Learning Models")
    
    # Model selection
    model_type = st.selectbox(
        "Choose Model Type",
        ["Classification", "Regression", "Clustering", "Time Series"]
    )
    
    if model_type == "Classification":
        st.subheader("📊 Classification Models")
        
        # Sample classification data
        from sklearn.datasets import make_classification
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import accuracy_score, classification_report
        
        # Generate sample data
        X, y = make_classification(n_samples=1000, n_features=20, n_informative=15, 
                                 n_redundant=5, random_state=42)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # Predictions
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Display results
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric("Accuracy", f"{accuracy:.2%}")
            st.metric("Training Samples", len(X_train))
            st.metric("Test Samples", len(X_test))
        
        with col2:
            st.write("**Classification Report:**")
            st.text(classification_report(y_test, y_pred))
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'Feature': [f'Feature_{i}' for i in range(X.shape[1])],
            'Importance': model.feature_importances_
        }).sort_values('Importance', ascending=False)
        
        fig = px.bar(feature_importance.head(10), x='Importance', y='Feature', 
                    title="Top 10 Feature Importance",
                    orientation='h')
        st.plotly_chart(fig, use_container_width=True)

elif page == "📈 Predictive Models":
    st.title("📈 Predictive Models")
    
    # Time series forecasting
    st.subheader("⏰ Time Series Forecasting")
    
    # Generate sample time series data
    dates = pd.date_range(start='2020-01-01', end='2024-01-01', freq='M')
    np.random.seed(42)
    trend = np.linspace(100, 200, len(dates))
    seasonal = 20 * np.sin(2 * np.pi * np.arange(len(dates)) / 12)
    noise = np.random.normal(0, 5, len(dates))
    sales_data = trend + seasonal + noise
    
    ts_df = pd.DataFrame({
        'Date': dates,
        'Sales': sales_data
    })
    
    # Plot original data
    fig = px.line(ts_df, x='Date', y='Sales', title="Historical Sales Data")
    st.plotly_chart(fig, use_container_width=True)
    
    # Simple forecasting
    st.subheader("🔮 Sales Forecast")
    
    # Add forecast
    future_dates = pd.date_range(start='2024-01-01', end='2024-12-01', freq='M')
    forecast_trend = np.linspace(200, 250, len(future_dates))
    forecast_seasonal = 20 * np.sin(2 * np.pi * np.arange(len(future_dates)) / 12)
    forecast_noise = np.random.normal(0, 5, len(future_dates))
    forecast_sales = forecast_trend + forecast_seasonal + forecast_noise
    
    forecast_df = pd.DataFrame({
        'Date': future_dates,
        'Sales': forecast_sales,
        'Type': 'Forecast'
    })
    
    # Combine historical and forecast
    ts_df['Type'] = 'Historical'
    combined_df = pd.concat([ts_df, forecast_df])
    
    fig = px.line(combined_df, x='Date', y='Sales', color='Type', 
                  title="Sales Forecast (Next 12 Months)")
    fig.update_traces(line=dict(dash='dash'), selector=dict(name='Forecast'))
    st.plotly_chart(fig, use_container_width=True)

elif page == "🔍 Data Visualization":
    st.title("🔍 Interactive Data Visualization")
    
    # Sample datasets
    dataset = st.selectbox(
        "Choose a sample dataset",
        ["Iris Dataset", "Titanic Dataset", "Sales Data", "Customer Data"]
    )
    
    if dataset == "Iris Dataset":
        from sklearn.datasets import load_iris
        iris = load_iris()
        df = pd.DataFrame(iris.data, columns=iris.feature_names)
        df['target'] = iris.target
        df['species'] = df['target'].map({0: 'setosa', 1: 'versicolor', 2: 'virginica'})
        
        st.subheader("🌸 Iris Dataset Analysis")
        
        # Scatter plot
        x_col = st.selectbox("X-axis:", iris.feature_names, index=0)
        y_col = st.selectbox("Y-axis:", iris.feature_names, index=1)
        
        fig = px.scatter(df, x=x_col, y=y_col, color='species', 
                        title=f"{x_col} vs {y_col} by Species")
        st.plotly_chart(fig, use_container_width=True)
        
        # Box plot
        fig = px.box(df, x='species', y=x_col, title=f"{x_col} Distribution by Species")
        st.plotly_chart(fig, use_container_width=True)
        
        # Correlation heatmap
        numerical_df = df[iris.feature_names]
        corr = numerical_df.corr()
        fig = px.imshow(corr, title="Feature Correlation Matrix", 
                       color_continuous_scale='RdBu')
        st.plotly_chart(fig, use_container_width=True)

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; padding: 2rem;">
    <p>🤖 DataWeb ML Hub | Powered by Streamlit</p>
    <p>Advanced Analytics & Machine Learning Solutions</p>
</div>
""", unsafe_allow_html=True)
