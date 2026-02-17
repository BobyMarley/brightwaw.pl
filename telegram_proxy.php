<?php
// ===== РљРћРќР¤РР“РЈР РђР¦РРЇ (РЎР•РљР Р•РўРќР«Р• Р”РђРќРќР«Р•) =====
$telegramBotToken = '6339860942:AAFolHF7Pk1HCLWwDIGhkvYEr2P-9eEBUgw';
$telegramChatId = '1137562732';

// РЈСЃС‚Р°РЅР°РІР»РёРІР°РµРј Р·Р°РіРѕР»РѕРІРѕРє, С‡С‚РѕР±С‹ РєР»РёРµРЅС‚СЃРєРёР№ СЃРєСЂРёРїС‚ РїРѕРЅРёРјР°Р», С‡С‚Рѕ РѕС‚РІРµС‚ РІ С„РѕСЂРјР°С‚Рµ JSON
header('Content-Type: application/json');

// РџСЂРёРЅРёРјР°РµРј Р·Р°РїСЂРѕСЃС‹ С‚РѕР»СЊРєРѕ РјРµС‚РѕРґРѕРј POST РґР»СЏ Р±РµР·РѕРїР°СЃРЅРѕСЃС‚Рё
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Only POST method is allowed.']);
    exit;
}

// РџРѕР»СѓС‡Р°РµРј JSON-СЃС‚СЂРѕРєСѓ РёР· С‚РµР»Р° Р·Р°РїСЂРѕСЃР°
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РґР°РЅРЅС‹Рµ РїРѕР»СѓС‡РµРЅС‹ Рё СЃРѕРґРµСЂР¶Р°С‚ РєР»СЋС‡ 'message'
if (!$data || !isset($data['message'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Invalid or missing data.']);
    exit;
}

// Р¤РѕСЂРјРёСЂСѓРµРј URL РґР»СЏ Р·Р°РїСЂРѕСЃР° Рє Telegram API
$url = "https://api.telegram.org/bot{$telegramBotToken}/sendMessage";

// Р¤РѕСЂРјРёСЂСѓРµРј С‚РµР»Рѕ Р·Р°РїСЂРѕСЃР° РґР»СЏ Telegram
$telegram_payload = [
    'chat_id' => $telegramChatId,
    'text' => $data['message'],
    'parse_mode' => 'HTML'
];

// РћС‚РїСЂР°РІР»СЏРµРј Р·Р°РїСЂРѕСЃ СЃ РїРѕРјРѕС‰СЊСЋ cURL (СЃС‚Р°РЅРґР°СЂС‚РЅС‹Р№ СЃРїРѕСЃРѕР± РІ PHP)
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($telegram_payload));
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // РЈСЃС‚Р°РЅР°РІР»РёРІР°РµРј С‚Р°Р№РјР°СѓС‚ РІ 10 СЃРµРєСѓРЅРґ

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// РџСЂРѕРІРµСЂСЏРµРј РѕС‚РІРµС‚ РѕС‚ Telegram Рё РѕС‚РїСЂР°РІР»СЏРµРј СЂРµР·СѓР»СЊС‚Р°С‚ РѕР±СЂР°С‚РЅРѕ РЅР° СЃР°Р№С‚
if ($http_code == 200 && $response) {
    echo json_encode(['success' => true, 'message' => 'Message sent successfully.']);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Failed to send message to Telegram.', 'details' => $response]);
}
?>

