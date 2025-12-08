import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px

# --- Configuration Constants (Can be moved to a separate config file) ---
DATA_FILE = 'crusher_analytics.csv'  # Path to the data file
THERMAL_EF = 0.8  # kg CO2 / kWh
PPT_TARGET = 0.45 # Target Power per Ton (kWh/Ton)

# --- 1. Data Loading and Preparation ---
@st.cache_data
def load_data():
    """Loads and preprocesses the crusher data."""
    df = pd.read_csv(DATA_FILE)
    df['Timestamp'] = pd.to_datetime(df['Timestamp'])
    # Calculate P_Total as sum of primary and secondary power
    df['P_Total (kW)'] = df['P_Primary (kW)'] + df['P_Secondary (kW)']
    # Heuristic: sometimes the file's "Throughput (Tons/Hr)" column actually contains
    # power-per-ton values. Detect and handle both cases.
    mean_throughput = df['Throughput (Tons/Hr)'].abs().mean()
    # If the mean is small (<50), assume the column stores Power-per-Ton (kWh/Ton)
    throughput_is_ppt = mean_throughput < 50
    if throughput_is_ppt:
        # Interpret the existing column as Power per Ton, and compute throughput from power
        df['Power per Ton (kWh/Ton)'] = df['Throughput (Tons/Hr)']
        # Avoid divide-by-zero
        df['Throughput (Tons/Hr)'] = df['P_Total (kW)'] / (df['Power per Ton (kWh/Ton)'].replace(0, np.nan))
        df['Throughput (Tons/Hr)'] = df['Throughput (Tons/Hr)'].fillna(0)
    else:
        # Normal case: Throughput is in Tons/Hr, so compute Power per Ton
        df['Power per Ton (kWh/Ton)'] = df['P_Total (kW)'] / (df['Throughput (Tons/Hr)'] + 1e-6)
    # Record the detection result for downstream logic or debugging
    df['Throughput_is_PowerPerTon'] = throughput_is_ppt
    # Calculate Carbon Consumption based on thermal energy percentage
    df['Carbon Consumption (kg CO2)'] = df['P_Total (kW)'] * df['%E_Thermal'] / 100 * THERMAL_EF
    # Add Component Life Hours as a proxy (random for now, can be updated with real data)
    df['Component_Life (Hours)'] = np.random.randint(500, 2000, len(df))
    df_running = df[df['Status'] == 'Running'].copy()
    return df, df_running

df, df_running = load_data()

# --- 2. Core Dashboard Calculations ---
# Calculate key metrics for KIPs (Key Performance Indicators)
average_ppt = df_running['Power per Ton (kWh/Ton)'].mean()
total_power_consumed = (df['P_Total (kW)'] * ((df['Timestamp'].iloc[1] - df['Timestamp'].iloc[0]).total_seconds() / 3600)).sum()
total_carbon_footprint = df['Carbon Consumption (kg CO2)'].sum()
energy_saving_potential = max(0, (PPT_TARGET - average_ppt) * df_running['Throughput (Tons/Hr)'].sum() * ((df['Timestamp'].iloc[-1] - df['Timestamp'].iloc[0]).total_seconds() / 3600 / len(df_running)))

# Determine Energy Score (Example logic: Higher score for lower PPT compared to target)
# Score is relative to target: Max 100, min 0. 
# 0.45 kWh/Ton = 100 score; 0.65 kWh/Ton = 0 score (arbitrary range)
score_range = 0.20 # 0.65 - 0.45
energy_score = np.clip(100 * (1 - (average_ppt - PPT_TARGET) / score_range), 0, 100)

# Downtime Calculations
total_planned_dt = df['Planned Downtime (Hrs)'].sum()
total_unplanned_dt = df['Unplanned Downtime (Hrs)'].sum()


# --- 3. Streamlit UI Layout ---
st.set_page_config(layout="wide", page_title="Crusher Energy Efficiency Optimizer")
st.title("⛏️ Comminution Energy Efficiency Dashboard")

# --- ROW 1: KPIs (Metrics) ---
st.header("Energy Efficiency & Carbon Footprint Analysis")

col1, col2, col3, col4 = st.columns(4)

col1.metric("1. Avg Power per Ton", f"{average_ppt:.3f} kWh/Ton", 
            delta=f"Target: {PPT_TARGET} kWh/Ton")
col2.metric("Total Power Consumed", f"{total_power_consumed:.0f} kWh")
col3.metric("Total Carbon Footprint", f"{total_carbon_footprint:.0f} kg CO₂", 
            delta=f"{energy_saving_potential:.0f} kWh Potential Saving")
col4.metric("3. Energy Score (0-100)", f"{energy_score:.1f}")

st.markdown("---")


# --- ROW 2: Primary Visualizations (Time-Series and Relationship) ---
col5, col6 = st.columns(2)

with col5:
    st.subheader("1 & 2. Total Power and Efficiency Trend")
    # Time-series plot of Total Power and Power per Ton
    fig = px.line(df, x='Timestamp', y=['P_Total (kW)', 'Power per Ton (kWh/Ton)'], 
                  title='Primary and Total Power vs. Power per Ton',
                  labels={'value': 'Value', 'variable': 'Metric'})
    
    # Add target line for PPT
    fig.add_hline(y=PPT_TARGET, line_dash="dot", line_color="red", 
                  annotation_text="PPT Target", annotation_position="bottom right")
    
    # Customize axis for dual display feel (though Plotly handles multiple y-axes better)
    fig.update_layout(height=400, legend_title_text='')
    st.plotly_chart(fig, use_container_width=True)

with col6:
    st.subheader("4. Throughput - Energy Curve")
    # Scatter plot: Throughput vs. Power per Ton
    fig = px.scatter(df_running, x='Throughput (Tons/Hr)', y='Power per Ton (kWh/Ton)',
                     color='T_Primary (°C)', size='P_Total (kW)',
                     hover_data=['Timestamp', 'P_Primary (kW)', 'P_Secondary (kW)'],
                     title='Energy Efficiency vs. Production Rate')
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)

st.markdown("---")

# --- ROW 3: Categorical and Maintenance Analysis ---
col7, col8, col9 = st.columns(3)

with col7:
    st.subheader("6. Energy Source Attribution")
    # Group power consumption by energy source
    energy_mix_df = pd.DataFrame({
        'Source': ['Thermal', 'Solar'],
        'Total Power Proxy (kW)': [
            (df['P_Total (kW)'] * (df['%E_Thermal'] / 100)).sum(),
            (df['P_Total (kW)'] * (df['%E_Solar'] / 100)).sum()
        ]
    })
    
    fig = px.pie(energy_mix_df, values='Total Power Proxy (kW)', names='Source', 
                 title='Total Energy Share by Source',
                 color_discrete_sequence=px.colors.sequential.Plotly3)
    fig.update_traces(textinfo='percent+label')
    st.plotly_chart(fig, use_container_width=True)

with col8:
    st.subheader("5. Alerts Raised Analysis")
    # Bar chart of Alert Types
    alert_counts = df[(df['Alert Type'] != 'None') & (df['Alert Type'].notna())]['Alert Type'].value_counts().reset_index()
    alert_counts.columns = ['Alert Type', 'count']

    fig = px.bar(alert_counts, x='Alert Type', y='count', 
                 title='Alert Distribution (Last 30 Days)',
                 color='Alert Type', color_discrete_sequence=px.colors.qualitative.Bold)
    fig.update_xaxes(title_text="")
    st.plotly_chart(fig, use_container_width=True)

with col9:
    st.subheader("9. Downtime Analysis")
    # Downtime Bar Chart
    downtime_summary = pd.DataFrame({
        'Type': ['Planned Maintenance', 'Unplanned Maintenance'],
        'Total Hours': [total_planned_dt, total_unplanned_dt]
    })
    
    fig = px.bar(downtime_summary, x='Type', y='Total Hours', color='Type',
                 title='Total Downtime Hours',
                 color_discrete_map={'Planned Maintenance': 'blue', 'Unplanned Maintenance': 'red'})
    fig.update_xaxes(title_text="")
    st.plotly_chart(fig, use_container_width=True)

st.markdown("---")

# --- ROW 4: Detailed Operational Conditions ---
st.subheader("7. Operating Conditions of Crusher - Temperature")

col10, col11 = st.columns(2)

with col10:
    st.write("Temperature Distribution")
    fig = px.histogram(df_running, x='T_Primary (°C)', color_discrete_sequence=['green'],
                       marginal="box", title="Primary Crusher Temperature Distribution")
    fig.add_vline(x=70, line_dash="dash", line_color="red", annotation_text="Threshold")
    st.plotly_chart(fig, use_container_width=True)

with col11:
    st.write("Temperature Time Series")
    fig = px.line(df, x='Timestamp', y='T_Primary (°C)', color='Status',
                  title="Crusher Temperature Over Time (Colored by Status)")
    st.plotly_chart(fig, use_container_width=True)

# --- 4. Mean Time to Replace (MTTR) Insight ---
st.header("8. Mean Time to Replace Crusher (MTTR)")
st.info(
    "To accurately calculate **Mean Time To Replace (MTTR)**, you need historical records of component **Failures** and **Replacements** (Date/Time) for specific components (e.g., liners, bearings). "
    "Using the `Component_Life (Hours)` column in the generated data, we can calculate the average operating life between replacements."
)

# Calculate Mean Component Life (proxy for MTTR, assuming the data represents life at replacement)
avg_component_life = df['Component_Life (Hours)'].mean()
st.metric("Avg Component Operating Life", f"{avg_component_life:.0f} Hours")