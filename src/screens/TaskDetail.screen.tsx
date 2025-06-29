/**
 * Tela de detalhes de uma tarefa.
 *
 * Exibe informações detalhadas sobre uma tarefa específica, incluindo título, descrição e status.
 * Permite ao usuário editar ou excluir a tarefa selecionada.
 *
 * - Carrega os dados da tarefa ao focar na tela.
 * - Mostra indicador de carregamento enquanto busca os dados.
 * - Exibe mensagem amigável caso a tarefa não seja encontrada.
 * - Permite navegação para a tela de edição da tarefa.
 * - Permite exclusão da tarefa com confirmação do usuário.
 *
 * @component
 * @param {TaskDetailScreenProps} props - Propriedades de navegação e rota, incluindo o `taskId` da tarefa a ser exibida.
 * @returns {JSX.Element} Componente de tela de detalhes da tarefa.
 */


import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { getTaskById, deleteTask } from '../database/database';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Task } from '../types/Task.type';



// Tipagem para as rotas do aplicativo e seus parametrs
type RootStackParamList = {
    TaskList: undefined;
    TaskForm: { taskId?: number } | undefined;
    TaskDetail: { taskId: number };
};

// tipagem para as propriedades da tela de detalhes
type TaskDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

// Definição da interface Task
interface TaskEnchanced extends Task {
    id: number;
}

export default function TaskDetailScreen({ route, navigation }: TaskDetailScreenProps) {
    // Extrair o taskId dos parametros da rota
    const { taskId } = route.params;

    // Definição de estados para armazenar a task e o estado de loading
    const [task, setTask] = useState<TaskEnchanced | null>(null);
    const [loading, setLoading] = useState(true);

    // Função para carregar os dados da tarefa
    const loadTask = useCallback(async () => {
        setLoading(true);
        try {
            // chamada do banco
            const fetchedTask = await getTaskById(taskId);
            if (fetchedTask) {
                // Atualização do estado
                setTask(fetchedTask as TaskEnchanced);
            } else {
                // Fallback caso a tarefa não seja encontrada
                Alert.alert('Erro', 'Tarefa não encontrada.');
                navigation.goBack();
            }
        } catch (error) {
            // Fallback para tratamento de erros
            console.error('Erro ao carregar detalhes da tarefa:', error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes da tarefa.');
            navigation.goBack();
        } finally {
            // Atualização do estado de loading
            setLoading(false);
        }
    }, [taskId, navigation]);

    // Efeito para carregar a tarefa quando a tela for focada
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadTask();
        });
        return unsubscribe;
    }, [navigation, loadTask]);

    // Função para lidar com a exclusão da tarefa a partir do evento de toque no botão
    const handleDeleteTask = useCallback(() => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir esta tarefa?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: async () => {
                        try {
                            // Chamada assíncrona para excluir a tarefa
                            await deleteTask(taskId);
                            Alert.alert('Sucesso', 'Tarefa excluída com sucesso!');
                            navigation.navigate('TaskList');
                        } catch (error) {
                            console.error('Erro ao excluir tarefa:', error);
                            Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
                        }
                    },
                },
            ],
            // Tornar o alerta cancelável
            { cancelable: true }
        );
    }, [taskId, navigation]);

    // Renderizar loading condicionado pelo estado
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Carregando detalhes...</Text>
            </View>
        );
    }

    // Tarefa não encontrada, renderiza mensagem amigável
    if (!task) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Tarefa não disponível.</Text>
            </View>
        );
    }

    // Renderizar os detalhes da tarefa
    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
                <Text style={styles.title}>{task.title}</Text>

                {task.description ? (
                    <Text style={styles.description}>{task.description}</Text>
                ) : (
                    <Text style={styles.noDescriptionText}>Nenhuma descrição fornecida.</Text>
                )}

                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                        Status: {task.status === 'pending' ? 'Pendente' : 'Concluída'}
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => navigation.navigate('TaskForm', { taskId: task.id })}
                    >
                        <MaterialIcons name="edit" size={24} color="#fff" />
                        <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={handleDeleteTask}
                    >
                        <MaterialIcons name="delete" size={24} color="#fff" />
                        <Text style={styles.buttonText}>Excluir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

// Estilos da tela
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6200ee',
    },
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 20,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 25,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6200ee', // Título em roxo
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
        marginBottom: 20,
    },
    noDescriptionText: {
        fontSize: 15,
        fontStyle: 'italic',
        color: '#888',
        marginBottom: 20,
        textAlign: 'center',
    },
    statusBadge: {
        backgroundColor: '#E0BBE4', // Roxo claro para o badge de status
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignSelf: 'flex-start', // Para o badge não ocupar a largura total
        marginBottom: 25,
    },
    statusText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#6200ee', // Texto em roxo
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee', // Linha divisória sutil
        paddingTop: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        gap: 8,
        flex: 1,
    },
    editButton: {
        backgroundColor: '#6200ee', // Roxo principal para editar
        marginRight: 10,
    },
    deleteButton: {
        backgroundColor: '#dc3545', // Vermelho para excluir
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 50,
    },
});