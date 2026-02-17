<?php
// ===== КОНФИГУРАЦИЯ (СЕКРЕТНЫЕ ДАННЫЕ) =====
$telegramBotToken = '6339860942:AAFolHF7Pk1HCLWwDIGhkvYEr2P-9eEBUgw';
$telegramChatId = '1137562732';

// Устанавливаем заголовок, чтобы клиентский скрипт понимал, что ответ в формате JSON
header('Content-Type: application/json');

// Принимаем запросы только методом POST для безопасности
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Only POST method is allowed.']);
    exit;
}

// Получаем JSON-строку из тела запроса
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Проверяем, что данные получены и содержат ключ 'message'
if (!$data || !isset($data['message'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid or missing data.']);
    exit;
}

// Формируем URL для запроса к Telegram API
$url = "https://api.telegram.org/bot{$telegramBotToken}/sendMessage";

// Формируем тело запроса для Telegram
$telegram_payload = [
    'chat_id' => $telegramChatId,
    'text' => $data['message'],
    'parse_mode' => 'HTML'
];

// Отправляем запрос с помощью cURL (стандартный способ в PHP)
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($telegram_payload));
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Устанавливаем таймаут в 10 секунд

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Проверяем ответ от Telegram и отправляем результат обратно на сайт
if ($http_code == 200 && $response) {
    echo json_encode(['success' => true, 'message' => 'Message sent successfully.']);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Failed to send message to Telegram.', 'details' => $response]);
}
?>