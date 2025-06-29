

/**
 * Tela de listagem de tarefas do aplicativo.
 *
 * Exibe uma lista de tarefas com opções para filtrar por status (todas, pendentes, concluídas),
 * adicionar nova tarefa, editar, excluir e alternar o status (pendente/concluída).
 * Permite navegação para detalhes e formulário de edição/criação de tarefas.
 *
 * @component
 * @param {TaskListScreenProps} props - Propriedades de navegação da tela.
 *
 * @returns {JSX.Element} O componente de tela de listagem de tarefas.
 *
 * @example
 * <TaskListScreen navigation={navigation} />
 *
 * @remarks
 * - Utiliza hooks para carregar tarefas do banco de dados ao focar na tela.
 * - Mostra indicador de carregamento enquanto busca as tarefas.
 * - Exibe mensagem caso não haja tarefas no filtro selecionado.
 * - Permite alternar status, editar e excluir tarefas diretamente na lista.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'; // REMOVIDO: Button
import { getTasks, deleteTask, updateTask } from '../database/database';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
    TaskList: undefined;
    TaskForm: { taskId?: number } | undefined;
    TaskDetail: { taskId: number };
};

type TaskListScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

interface Task {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'completed';
}

type FilterStatus = 'all' | 'pending' | 'completed';

export default function TaskListScreen({ navigation }: TaskListScreenProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>('all');

    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedTasks = await getTasks();
            setTasks(fetchedTasks as Task[]);
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            Alert.alert('Erro', 'Não foi possível carregar as tarefas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadTasks();
        });
        return unsubscribe;
    }, [navigation, loadTasks]);

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') {
            return true;
        }
        return task.status === filter;
    });

    const toggleTaskStatus = async (taskId: number, currentStatus: 'pending' | 'completed') => {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
        try {
            const taskToUpdate = tasks.find(task => task.id === taskId);
            if (taskToUpdate) {
                await updateTask(taskId, taskToUpdate.title, taskToUpdate.description, newStatus);
                loadTasks();
            }
        } catch (error) {
            console.error('Erro ao alternar status da tarefa:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o status da tarefa.');
        }
    };

    const renderItem = ({ item }: { item: Task }) => (
        <TouchableOpacity
            style={styles.taskItem}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
        >
            <TouchableOpacity
                onPress={() => toggleTaskStatus(item.id, item.status)}
                style={styles.checkboxContainer}
            >
                <MaterialIcons
                    name={item.status === 'completed' ? 'check-box' : 'check-box-outline-blank'}
                    size={28}
                    color={item.status === 'completed' ? 'green' : '#666'}
                />
            </TouchableOpacity>

            <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, item.status === 'completed' && styles.taskTitleCompleted]}>
                    {item.title}
                </Text>
                <Text style={[styles.taskStatus, item.status === 'completed' && styles.taskStatusCompleted]}>
                    Status: {item.status === 'pending' ? 'Pendente' : 'Concluída'}
                </Text>
            </View>
            <View style={styles.taskActions}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('TaskForm', { taskId: item.id })}
                    style={styles.iconButton}
                >
                    <MaterialIcons name="edit" size={24} color="#6200ee" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDeleteTask(item.id)}
                    style={styles.iconButton}
                >
                    <MaterialIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const handleDeleteTask = async (id: number) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir esta tarefa?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: async () => {
                        try {
                            await deleteTask(id);
                            Alert.alert('Sucesso', 'Tarefa excluída com sucesso!');
                            loadTasks();
                        } catch (error) {
                            console.error('Erro ao excluir tarefa:', error);
                            Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.navigate('TaskForm')}
                style={styles.newTaskButton}
            >
                <MaterialIcons name="add" size={24} color="#fff" />
                <Text style={styles.newTaskButtonText}>Adicionar Nova Tarefa</Text>
            </TouchableOpacity>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>Todas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
                    onPress={() => setFilter('pending')}
                >
                    <Text style={[styles.filterButtonText, filter === 'pending' && styles.filterButtonTextActive]}>Pendentes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
                    onPress={() => setFilter('completed')}
                >
                    <Text style={[styles.filterButtonText, filter === 'completed' && styles.filterButtonTextActive]}>Concluídas</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
            ) : filteredTasks.length === 0 ? (
                <Text style={styles.noTasksText}>Nenhuma tarefa {filter === 'all' ? '' : filter === 'pending' ? 'pendente' : 'concluída'} encontrada.</Text>
            ) : (
                <FlatList
                    data={filteredTasks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F3F4F6',
    },
    loadingIndicator: {
        marginTop: 50,
    },
    noTasksText: {
        marginTop: 20,
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
    },
    listContainer: {
        paddingBottom: 20,
    },
    taskItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    checkboxContainer: {
        marginRight: 10,
        padding: 5,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    taskTitleCompleted: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
    taskStatus: {
        fontSize: 14,
        color: '#666',
    },
    taskStatusCompleted: {
        color: 'green',
        fontWeight: 'bold',
    },
    taskActions: {
        flexDirection: 'row',
        gap: 5,
        marginLeft: 10,
    },
    iconButton: {
        padding: 8,
        borderRadius: 5,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        marginTop: 10,
        backgroundColor: '#E0BBE4',
        borderRadius: 10,
        padding: 5,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    filterButtonActive: {
        backgroundColor: '#6200ee',
    },
    filterButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#6200ee',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    newTaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6200ee',
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        gap: 8,
    },
    newTaskButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});