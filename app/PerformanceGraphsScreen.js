// app/PerformanceGraphsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 40;
const GRAPH_HEIGHT = 200;

export default function PerformanceGraphsScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem('training_sessions');
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const getChartData = () => {
    const now = new Date();
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(s => s.date === dateStr);
      const totalMinutes = daySessions.reduce((sum, s) => sum + parseInt(s.duration || 0), 0);
      
      data.push({
        date: dateStr,
        label: timeRange === 'week' ? date.toLocaleDateString('en', { weekday: 'short' }) : 
               timeRange === 'month' ? date.getDate() : 
               date.toLocaleDateString('en', { month: 'short' }),
        minutes: totalMinutes,
        sessions: daySessions.length
      });
    }

    return data;
  };

  const renderBarChart = () => {
    const data = getChartData();
    const maxMinutes = Math.max(...data.map(d => d.minutes), 1);
    const barWidth = (GRAPH_WIDTH / data.length) - 4;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Training Minutes</Text>
        <View style={styles.chart}>
          <View style={styles.yAxis}>
            <Text style={styles.axisLabel}>{maxMinutes}</Text>
            <Text style={styles.axisLabel}>{Math.floor(maxMinutes / 2)}</Text>
            <Text style={styles.axisLabel}>0</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.barsContainer}>
              <View style={styles.bars}>
                {data.map((item, index) => {
                  const height = (item.minutes / maxMinutes) * (GRAPH_HEIGHT - 40);
                  return (
                    <View key={index} style={styles.barWrapper}>
                      <View style={styles.barContainer}>
                        <View style={[styles.bar, { height: height || 2, width: barWidth }]} />
                      </View>
                      <Text style={styles.barLabel}>{item.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderSessionsChart = () => {
    const data = getChartData();
    const maxSessions = Math.max(...data.map(d => d.sessions), 1);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Training Sessions</Text>
        <View style={styles.lineChart}>
          {data.map((item, index) => {
            const height = (item.sessions / maxSessions) * 60;
            return (
              <View key={index} style={styles.linePoint}>
                <View style={[styles.point, { bottom: height }]}>
                  <Text style={styles.pointValue}>{item.sessions}</Text>
                </View>
                <Text style={styles.lineLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getStats = () => {
    const data = getChartData();
    const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
    const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
    const avgMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    const activeDays = data.filter(d => d.sessions > 0).length;

    return { totalMinutes, totalSessions, avgMinutes, activeDays };
  };

  const stats = getStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>â† Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ðŸ“ˆ Performance Graphs</Text>
      </View>

      <View style={styles.timeRangeContainer}>
        {['week', 'month', 'year'].map(range => (
          <TouchableOpacity
            key={range}
            style={[styles.timeButton, timeRange === range && styles.activeTimeButton]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[styles.timeText, timeRange === range && styles.activeTimeText]}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Math.floor(stats.totalMinutes / 60)}h</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.avgMinutes}m</Text>
            <Text style={styles.statLabel}>Avg/Session</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.activeDays}</Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
        </View>

        {renderBarChart()}
        {renderSessionsChart()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { padding: 20, alignItems: 'center' },
  backButton: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700' },
  timeRangeContainer: { flexDirection: 'row', padding: 20, gap: 10 },
  timeButton: { flex: 1, backgroundColor: '#1b263b', padding: 12, borderRadius: 8, alignItems: 'center' },
  activeTimeButton: { backgroundColor: '#1e88e5' },
  timeText: { color: '#a8dadc', fontSize: 14, fontWeight: '600' },
  activeTimeText: { color: '#fff' },
  content: { flex: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 20, gap: 10 },
  statBox: { backgroundColor: '#1b263b', borderRadius: 12, padding: 15, width: '48%', alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#ffd700', marginBottom: 5 },
  statLabel: { fontSize: 12, color: '#a8dadc' },
  chartContainer: { backgroundColor: '#1b263b', borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1faee', marginBottom: 15 },
  chart: { flexDirection: 'row' },
  yAxis: { width: 40, justifyContent: 'space-between', height: GRAPH_HEIGHT - 40, paddingVertical: 5 },
  axisLabel: { fontSize: 10, color: '#a8dadc' },
  barsContainer: { height: GRAPH_HEIGHT },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: GRAPH_HEIGHT - 40 },
  barWrapper: { alignItems: 'center', marginHorizontal: 2 },
  barContainer: { height: GRAPH_HEIGHT - 60, justifyContent: 'flex-end' },
  bar: { backgroundColor: '#1e88e5', borderRadius: 4 },
  barLabel: { fontSize: 10, color: '#a8dadc', marginTop: 5 },
  lineChart: { flexDirection: 'row', justifyContent: 'space-around', height: 100, position: 'relative' },
  linePoint: { alignItems: 'center', flex: 1 },
  point: { position: 'absolute', backgroundColor: '#1e88e5', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  pointValue: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  lineLabel: { position: 'absolute', bottom: -20, fontSize: 10, color: '#a8dadc' },
});
