"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/upload-real-files.ts
var supabase_js_1 = require("@supabase/supabase-js");
var client_s3_1 = require("@aws-sdk/client-s3");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var dotenv_1 = require("dotenv");
// Load environment variables
dotenv_1.default.config({ path: '.env.local' });
var CONFIG = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'looplib-samples',
    R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
};
var supabase = (0, supabase_js_1.createClient)(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);
var r2Client = new client_s3_1.S3Client({
    region: "auto",
    endpoint: "https://".concat(CONFIG.R2_ACCOUNT_ID, ".r2.cloudflarestorage.com"),
    credentials: {
        accessKeyId: CONFIG.R2_ACCESS_KEY,
        secretAccessKey: CONFIG.R2_SECRET_KEY,
    },
});
function uploadToR2(key, body, contentType) {
    return __awaiter(this, void 0, void 0, function () {
        var command, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("  Uploading to R2: ".concat(key));
                    command = new client_s3_1.PutObjectCommand({
                        Bucket: CONFIG.R2_BUCKET_NAME,
                        Key: key,
                        Body: body,
                        ContentType: contentType,
                        CacheControl: 'public, max-age=31536000',
                    });
                    return [4 /*yield*/, r2Client.send(command)];
                case 1:
                    _a.sent();
                    url = "".concat(CONFIG.R2_PUBLIC_URL, "/").concat(key);
                    console.log("  \u2713 Uploaded to: ".concat(url));
                    return [2 /*return*/, url];
            }
        });
    });
}
function updateSampleUrls() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, samples, error, _i, _b, sample, localFilePath, fileBuffer, timestamp, r2Key, newUrl, updateError, fileError_1, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('Starting to update sample URLs...\n');
                    return [4 /*yield*/, supabase
                            .from('samples')
                            .select('*')
                            .like('file_url', '%soundhelix%')];
                case 1:
                    _a = _c.sent(), samples = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching samples:', error);
                        return [2 /*return*/];
                    }
                    console.log("Found ".concat((samples === null || samples === void 0 ? void 0 : samples.length) || 0, " samples with test URLs\n"));
                    _i = 0, _b = samples || [];
                    _c.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 14];
                    sample = _b[_i];
                    console.log("Processing: ".concat(sample.name));
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 10, , 11]);
                    localFilePath = path_1.default.join('./samples', sample.genre, "".concat(sample.file_name));
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 8, , 9]);
                    return [4 /*yield*/, promises_1.default.readFile(localFilePath)];
                case 5:
                    fileBuffer = _c.sent();
                    timestamp = Date.now();
                    r2Key = "samples/".concat(sample.genre, "/").concat(timestamp, "_").concat(sample.file_name);
                    return [4 /*yield*/, uploadToR2(r2Key, fileBuffer, 'audio/mpeg')];
                case 6:
                    newUrl = _c.sent();
                    return [4 /*yield*/, supabase
                            .from('samples')
                            .update({
                            file_url: newUrl,
                            file_size: fileBuffer.length
                        })
                            .eq('id', sample.id)];
                case 7:
                    updateError = (_c.sent()).error;
                    if (updateError) {
                        console.error("  \u2717 Failed to update database:", updateError);
                    }
                    else {
                        console.log("  \u2713 Updated successfully!");
                    }
                    return [3 /*break*/, 9];
                case 8:
                    fileError_1 = _c.sent();
                    console.log("  \u26A0 No local file found at ".concat(localFilePath));
                    console.log("  \u2192 Please add audio files to: ".concat(localFilePath));
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_1 = _c.sent();
                    console.error("  \u2717 Error processing ".concat(sample.name, ":"), error_1);
                    return [3 /*break*/, 11];
                case 11: 
                // Small delay to avoid rate limiting
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 12:
                    // Small delay to avoid rate limiting
                    _c.sent();
                    _c.label = 13;
                case 13:
                    _i++;
                    return [3 /*break*/, 2];
                case 14:
                    console.log('\n✓ Update complete!');
                    return [2 /*return*/];
            }
        });
    });
}
// For testing, let's create a function to generate test audio and upload
function uploadTestAudio() {
    return __awaiter(this, void 0, void 0, function () {
        var testAudioUrl, response, audioBuffer, _a, _b, samples, _i, _c, sample, timestamp, r2Key, newUrl, error;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('Uploading test audio files to R2...\n');
                    testAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
                    console.log('Downloading test audio...');
                    return [4 /*yield*/, fetch(testAudioUrl)];
                case 1:
                    response = _d.sent();
                    _b = (_a = Buffer).from;
                    return [4 /*yield*/, response.arrayBuffer()];
                case 2:
                    audioBuffer = _b.apply(_a, [_d.sent()]);
                    console.log('✓ Downloaded test audio\n');
                    return [4 /*yield*/, supabase
                            .from('samples')
                            .select('*')
                            .limit(10)];
                case 3:
                    samples = (_d.sent()).data;
                    _i = 0, _c = samples || [];
                    _d.label = 4;
                case 4:
                    if (!(_i < _c.length)) return [3 /*break*/, 9];
                    sample = _c[_i];
                    console.log("Updating ".concat(sample.name, "..."));
                    timestamp = Date.now();
                    r2Key = "samples/".concat(sample.genre, "/").concat(timestamp, "_").concat(sample.id, ".mp3");
                    return [4 /*yield*/, uploadToR2(r2Key, audioBuffer, 'audio/mpeg')];
                case 5:
                    newUrl = _d.sent();
                    return [4 /*yield*/, supabase
                            .from('samples')
                            .update({
                            file_url: newUrl,
                            file_size: audioBuffer.length
                        })
                            .eq('id', sample.id)];
                case 6:
                    error = (_d.sent()).error;
                    if (error) {
                        console.error('  ✗ Update failed:', error);
                    }
                    else {
                        console.log('  ✓ Updated successfully!');
                    }
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 7:
                    _d.sent();
                    _d.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9:
                    console.log('\n✓ All samples updated with test audio!');
                    return [2 /*return*/];
            }
        });
    });
}
// Main function
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('=== R2 Audio Upload Script ===\n');
                    console.log('Configuration:');
                    console.log('- R2 Bucket:', CONFIG.R2_BUCKET_NAME);
                    console.log('- R2 Public URL:', CONFIG.R2_PUBLIC_URL);
                    console.log('- Supabase URL:', CONFIG.SUPABASE_URL);
                    console.log('');
                    args = process.argv.slice(2);
                    if (!(args[0] === '--test')) return [3 /*break*/, 2];
                    // Upload test audio to all samples
                    return [4 /*yield*/, uploadTestAudio()];
                case 1:
                    // Upload test audio to all samples
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: 
                // Update samples with real files
                return [4 /*yield*/, updateSampleUrls()];
                case 3:
                    // Update samples with real files
                    _a.sent();
                    console.log('\nTo upload test audio to all samples, run:');
                    console.log('npm run upload-real-files -- --test');
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
