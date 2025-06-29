// src/components/AppLayout.tsx
import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native'; // NOVO: useNavigation, CommonActions
import AsyncStorage from 'expo-sqlite/kv-store';

WebBrowser.maybeCompleteAuthSession();

interface UserInfo {
    name: string;
    email: string;
    picture: string;
}

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [showBackButton, setShowBackButton] = useState(false); // NOVO: Estado para o botão voltar

    const navigation = useNavigation(); // NOVO: Hook para acessar a navegação

    const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId as string;
    const googleAndroidClientId = Constants.expoConfig?.extra?.googleAndroidClientId as string;
    const googleIosClientId = Constants.expoConfig?.extra?.googleIosClientId as string;

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: googleWebClientId,
        androidClientId: googleAndroidClientId,
        iosClientId: googleIosClientId,
        scopes: ['profile', 'email'],
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                fetchUserInfo(authentication.accessToken);
            }
        }
    }, [response]);

    // NOVO: Efeito para controlar a visibilidade do botão voltar
    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            // Verifica se a rota atual é a primeira da pilha (geralmente a Home/TaskList)
            const state = navigation.getState();
            if (state && state.routes && typeof state.index === 'number') {
                const currentRoute = state.routes[state.index];
                // Se a rota atual não for a "TaskList", mostra o botão voltar
                setShowBackButton(currentRoute.name !== 'TaskList');
            }
        });

        return unsubscribe;
    }, [navigation]);


    const fetchUserInfo = async (accessToken: string) => {
        try {
            const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const user = await res.json();
            setUserInfo(user);
            await AsyncStorage.setItem('userToken', accessToken);
            await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        } catch (error) {
            console.error('Erro ao buscar informações do usuário:', error);
            Alert.alert('Erro no Login', 'Não foi possível obter suas informações do Google.');
        }
    };

    const checkStoredUser = useCallback(async () => {
        setLoadingAuth(true);
        try {
            const storedUserInfo = await AsyncStorage.getItem('userInfo');
            if (storedUserInfo) {
                setUserInfo(JSON.parse(storedUserInfo));
            }
        } catch (error) {
            console.error('Erro ao verificar usuário armazenado:', error);
        } finally {
            setLoadingAuth(false);
        }
    }, []);

    useEffect(() => {
        checkStoredUser();
    }, [checkStoredUser]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
        setUserInfo(null);
        Alert.alert('Deslogado', 'Sua sessão foi encerrada.');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeAreaHeader}>
                {loadingAuth ? (
                    <View style={styles.loadingHeaderContainer}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.loadingText}>Verificando sessão...</Text>
                    </View>
                ) : (
                    <View style={styles.header}>
                        {/* NOVO: Botão Voltar */}
                        {showBackButton ? (
                            <TouchableOpacity onPress={() => navigation.dispatch(CommonActions.goBack())} style={styles.backButton}>
                                <MaterialIcons name="arrow-back" size={28} color="#E0BBE4" />
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.headerTitle}>Gerenciador de Tarefas</Text>
                        )}

                        {userInfo ? (
                            <View style={styles.profileSection}>
                                {userInfo.picture && (
                                    <Image source={{ uri: userInfo.picture }} style={styles.profilePicture} />
                                )}
                                <Text style={styles.userName}>{userInfo.name.split(' ')[0]}</Text>
                                {/* MODIFICADO: Apenas ícone para o botão Sair */}
                                <TouchableOpacity
                                    onPress={handleLogout}
                                    style={styles.iconOnlyButton} // Novo estilo para botão apenas com ícone
                                >
                                    <MaterialIcons name="logout" size={24} color="#E0BBE4" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // MODIFICADO: Apenas ícone para o botão Login
                            <TouchableOpacity
                                onPress={() => promptAsync()}
                                disabled={!request}
                                style={styles.iconOnlyButton} // Novo estilo para botão apenas com ícone
                            >
                                <MaterialIcons name="login" size={24} color="#E0BBE4" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </SafeAreaView>

            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    safeAreaHeader: {
        backgroundColor: '#6200ee',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    loadingHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
    },
    loadingText: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10, // Ajuste para acomodar o botão voltar
        paddingVertical: 15,
        backgroundColor: '#6200ee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.5,
        flex: 1, // Permite que o título ocupe o espaço disponível
        textAlign: 'center', // Centraliza o título
        marginLeft: Platform.OS === 'ios' ? 0 : -20, // Ajuste para centralizar melhor em Android com o back button
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    profilePicture: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 2,
        borderColor: '#E0BBE4',
    },
    userName: {
        color: '#E0BBE4',
        fontSize: 15,
        fontWeight: '600',
    },
    // NOVO ESTILO: Botão apenas com ícone (para login/logout)
    iconOnlyButton: {
        padding: 8,
        borderRadius: 20, // Circular para ícone
        // backgroundColor: 'rgba(255,255,255,0.1)', // Opcional: um fundo sutil
    },
    // NOVO ESTILO: Botão Voltar
    backButton: {
        padding: 8,
        marginRight: 10,
    },
    content: {
        flex: 1,
    },
});