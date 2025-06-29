/**
 * App principal do Task Manager App.
 * Inicializa o banco de dados SQLite e configura a navegação entre telas.
 * Utiliza React Navigation para navegação stack e exibe um indicador de carregamento
 * enquanto o banco de dados está sendo inicializado.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

// Importações do React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getDb } from './database/database';
import TaskListScreen from './screens/TaskList.screen';
import TaskFormScreen from './screens/TaskForm.screen';
import TaskDetailScreen from './screens/TaskDetail.screen';
import AppLayout from './components/AppLayout';

// Definição dos tipos para as rotas e seus parâmetros
type RootStackParamList = {
  TaskList: undefined;
  TaskForm: { taskId?: number } | undefined;
  TaskDetail: { taskId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await getDb(); // Chama getDb para garantir que o banco esteja aberto e tabelas criadas
        setDbInitialized(true);
      } catch (e) {
        console.error("Falha ao inicializar o banco de dados:", e);
      }
    };
    initialize();
  }, []);

  // Enquanto o banco de dados não estiver inicializado, mostrar uma tela de carregamento
  if (!dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando banco de dados...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppLayout>
        <Stack.Navigator
          initialRouteName="TaskList"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="TaskList" component={TaskListScreen} />
          <Stack.Screen name="TaskForm" component={TaskFormScreen} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        </Stack.Navigator>
      </AppLayout>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fefae0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});